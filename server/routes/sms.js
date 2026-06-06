import express from 'express';
import { supabase } from '../lib/supabase.js';
import { analyzeMessage } from '../engine/heuristics.js';

const router = express.Router();

// POST /api/ingest-sms
router.post('/ingest-sms', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.' });
  }

  const { sender, message, targetPhone } = req.body;

  if (!sender || !message || !targetPhone) {
    return res.status(400).json({ error: 'Missing required fields: sender, message, targetPhone' });
  }

  try {
    // 1. Look up the protected user by targetPhone
    const { data: protectedUser, error: lookupErr } = await supabase
      .from('protected_users')
      .select('id, guardian_id, protection_level')
      .eq('phone', targetPhone)
      .single();

    if (lookupErr || !protectedUser) {
      return res.status(404).json({ error: 'Protected user not found' });
    }

    // 2. Analyze the message
    const analysis = analyzeMessage(message, sender);

    // 3. Insert the message
    const { data: msgData, error: msgErr } = await supabase
      .from('messages')
      .insert({
        sender: sender,
        message: message,
        status: analysis.riskVerdict,
        protected_user_id: protectedUser.id
      })
      .select()
      .single();

    if (msgErr) throw msgErr;

    // 4. Insert the heuristic analysis record
    await supabase.from('scam_analysis').insert({
      message_id: msgData.id,
      urgency_score: analysis.urgencyScore,
      link_score: analysis.linkScore,
      impersonation_score: analysis.impersonationScore,
      total_score: analysis.totalScore,
      risk_verdict: analysis.riskVerdict,
      flagged_keywords: analysis.flaggedKeywords,
      flagged_links: analysis.flaggedLinks,
    });

    // 5. If it's a quarantine/blocked risk, insert into alerts table
    if (analysis.riskVerdict === 'quarantine' || analysis.riskVerdict === 'blocked') {
      await supabase.from('alerts').insert({
        message_id: msgData.id,
        guardian_id: protectedUser.guardian_id,
        status: 'pending'
      });
    }

    res.status(200).json({
      success: true,
      result: analysis,
      message_id: msgData.id
    });
  } catch (error) {
    console.error('Error ingesting SMS:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

UPDATE t_p93576920_talent_studio_projec.olympiad_applications
SET status = 'sent',
    payment_status = 'paid',
    olympiad_status = 'finished'
WHERE id = 49 AND payment_id = 'TEST-PALETTE-001';

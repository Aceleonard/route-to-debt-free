// GET /api/keepalive: run by the Vercel cron in vercel.json (Monday and Thursday).
// Supabase pauses free projects after about a week without requests, which stops sync.
// This asks the sync service for a code that does not exist, so it never reads or changes anyone's budget.
const SUPA = {url:'https://bxxnsfvkkijoexxzttfs.supabase.co', key:'sb_publishable_DFaOBxp7kKXqmMRhaIRHeQ_K3Em8oot'};

module.exports = async function handler(req, res){
  try{
    const r = await fetch(SUPA.url + '/rest/v1/rpc/budget_vault_get', {
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPA.key,'Authorization':'Bearer '+SUPA.key},
      body: JSON.stringify({p_code:'KEEPALIVE-CHECK'})
    });
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.ok ? 200 : 502).json({ok:r.ok, status:r.status, at:new Date().toISOString()});
  }catch(e){
    res.status(502).json({ok:false, error:'Could not reach the sync service'});
  }
};

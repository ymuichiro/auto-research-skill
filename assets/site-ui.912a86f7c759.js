const startup=document.getElementById('spatial-startup');
if(startup){
  const retry=document.getElementById('spatial-startup-retry');
  const showError=()=>{
    startup.hidden=false;
    document.getElementById('spatial-startup-message').textContent=startup.dataset.error;
    retry.hidden=false;
  };
  retry.addEventListener('click',()=>location.reload());
  const timeout=setTimeout(()=>{if(!document.documentElement.classList.contains('spatial-active'))showError();},13000);
  addEventListener('spatial-unavailable',()=>{clearTimeout(timeout);showError();});
  addEventListener('spatial-ready',()=>{clearTimeout(timeout);startup.hidden=true;});
  addEventListener('error',event=>{if(event.target?.id==='spatial-entry'){clearTimeout(timeout);showError();}},true);
}

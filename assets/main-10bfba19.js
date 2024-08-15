(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function o(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=o(e);fetch(e.href,r)}})();const P="https://emily-charity-frontend.onrender.com/api/payments",C="Bearer sandbox_QbpEJylc3XRJ4iE8qe1axWfIGQ4k_H_bxfs3lkQt",E=async(n,t,o)=>{try{const s=await fetch(`${P}${n}`,{method:t,headers:{"Content-Type":"application/json",Authorization:C},body:o?JSON.stringify(o):void 0});if(!s.ok)throw new Error(`HTTP error! status: ${s.status}`);return await s.json()}catch(s){throw console.error("Unexpected error:",s),s}},A=n=>E("/create-paypal-order","POST",{amount:n}),O=(n,t,o,s)=>E("/create-billing-request","POST",{email:n,given_name:t,family_name:o,amount:s}).then(e=>e.billing_requests.id),N=n=>E("/create-billing-request-flow","POST",{billingRequestId:n}).then(t=>t.billing_request_flows.authorisation_url);let a="",f="",k=null;window.openModal=b;function T(){window.selectAmount=D,window.continueToDetails=R,window.setPaymentMethod=z,window.handleSubmit=$,window.openModal=b,window.closeModal=g;const n=document.getElementById("payment-modal"),t=document.querySelector(".close");n&&t?(t.addEventListener("click",g),n.addEventListener("click",o=>{o.target===n&&g()})):console.error("Modal or close button element not found."),_()}function _(){const n=document.querySelector(".burger-menu"),t=document.querySelector(".mobile-nav"),o=document.querySelector(".overlay");n&&t&&o&&(n.addEventListener("click",()=>{t.classList.toggle("show"),o.classList.toggle("show")}),o.addEventListener("click",()=>{t.classList.remove("show"),o.classList.remove("show")}),window.addEventListener("resize",()=>{window.innerWidth>760&&(t.classList.remove("show"),o.classList.remove("show"))}))}function D(n){a=n,document.getElementById("custom-amount").value=a,document.querySelectorAll("#amount-selection .btn").forEach(o=>o.classList.toggle("active",o.textContent.includes(`£${n}`)))}function R(){a=document.getElementById("custom-amount").value||a,a?(document.getElementById("amount-selection").classList.add("hidden"),b()):document.getElementById("amount-message").textContent="Please select or enter an amount."}function p(n){(n.key==="Escape"||n.target.matches(".payment-modal, .payment-modal .close"))&&g()}function b(){const n=document.getElementById("payment-modal"),t=document.getElementById("payment-message");n?(k||(k=n.cloneNode(!0)),t&&(t.textContent=""),n.style.display="block",document.getElementById("payment-details").classList.remove("hidden"),document.addEventListener("keydown",p),window.addEventListener("click",p)):console.error("Modal element not found.")}async function g(){const n=document.getElementById("payment-modal");if(n){n.style.display="none",document.body.classList.remove("no-scroll"),document.removeEventListener("keydown",p),window.removeEventListener("click",p),document.querySelectorAll("#paypal, #gocardless").forEach(e=>{e.classList.remove("hidden","active")});const o=document.getElementById("donation-form");o&&(o.reset(),o.classList.add("hidden"));const s=document.querySelector("#payment-details .title");s&&s.classList.remove("hidden"),document.getElementById("custom-amount").value=""}else console.error("Modal element not found.")}function z(n){f=n,document.querySelectorAll("#paypal, #gocardless").forEach(e=>{e.classList.toggle("active",e.id===n),e.classList.toggle("hidden",e.id!==n)});const o=document.getElementById("donation-form"),s=document.querySelector("#payment-details .title");o&&o.classList.remove("hidden"),s&&s.classList.add("hidden")}async function $(n){var d,l;n.preventDefault();const t=document.getElementById("email").value,o=document.getElementById("given-name").value,s=document.getElementById("family-name").value,e=document.getElementById("payment-message");if(a=document.getElementById("custom-amount").value||a,!o||!t){e.textContent="Please enter both your name and email.";return}const i=parseFloat(a);if(isNaN(i)||i<=0){e.textContent="Please enter a valid amount.";return}if(!f){e.textContent="Please select a payment method.";return}try{if(f==="paypal"){const m=(l=(d=(await A(i.toFixed(2))).links)==null?void 0:d.find(y=>y.rel==="approve"))==null?void 0:l.href;if(m)window.location.href=m;else throw new Error("Approval link not found in PayPal response.")}else if(f==="gocardless"){const u=await O(t,o,s,i),m=await N(u);e.innerHTML=`
        <div>
          <p>Click the link below to complete your donation of £${i}: <br>
          <a href="${m}" target="_blank" rel="noopener noreferrer" style="color: blue;" onclick="closeModal()">Complete Donation</a></p>
        </div>`}}catch(u){console.error("Unexpected error:",u),e.textContent="Error processing donation. Please try again later."}}document.addEventListener("DOMContentLoaded",()=>{const n=document.querySelectorAll(".count");function t(s,e){let r=0;const i=200,d=s.closest(".raised-info-each").querySelector("span").textContent.startsWith("£"),l=setInterval(()=>{r+=Math.ceil(e/i),r>=e&&(r=e,clearInterval(l)),s.textContent=d?`£ ${r.toLocaleString()}`:r.toLocaleString()},1)}function o(){const s=window.innerHeight+window.scrollY;n.forEach(e=>{if(e.getBoundingClientRect().top<s&&!e.classList.contains("animated")){const i=parseInt(e.parentElement.getAttribute("data-target"));t(e,i),e.classList.add("animated")}})}window.addEventListener("scroll",o),o()});document.addEventListener("DOMContentLoaded",()=>{const n=document.querySelector(".slides"),t=n.querySelectorAll("img"),o=document.querySelector(".prev"),s=document.querySelector(".next"),e=document.getElementById("lightbox"),r=document.querySelector(".lightbox-content"),i=document.querySelector(".lightbox .close"),d=document.querySelector(".indicators");let l=0,u;t.forEach((c,w)=>{const L=document.createElement("span");L.classList.add("dot"),L.addEventListener("click",()=>q(w)),d.appendChild(L)});const m=d.querySelectorAll(".dot");function y(){n.style.transform=`translateX(-${l*100}%)`,m.forEach(c=>c.classList.toggle("active",c.classList.contains("dot")&&c===m[l]))}function S(){l=l===0?t.length-1:l-1,y(),v()}function h(){l=l===t.length-1?0:l+1,y(),v()}function q(c){l=c,y(),v()}function B(c){l=c,e.style.display="block",r.src=t[l].src}function x(){l=l===t.length-1?0:l+1,r.src=t[l].src}function M(){l=l===0?t.length-1:l-1,r.src=t[l].src}function I(){u=setInterval(h,3e3)}function v(){clearInterval(u),I()}o.addEventListener("click",S),s.addEventListener("click",h),i.addEventListener("click",()=>e.style.display="none"),window.addEventListener("click",c=>{c.target===e&&(e.style.display="none")}),document.addEventListener("keydown",c=>{e.style.display==="block"?(c.key==="ArrowRight"&&x(),c.key==="ArrowLeft"&&M(),c.key==="Escape"&&(e.style.display="none")):(c.key==="ArrowLeft"&&S(),c.key==="ArrowRight"&&h())}),t.forEach((c,w)=>{c.addEventListener("click",()=>B(w))}),I()});document.addEventListener("DOMContentLoaded",()=>{const n=document.querySelectorAll("img.lazy");if("IntersectionObserver"in window){const t=new IntersectionObserver(o=>{o.forEach(s=>{if(s.isIntersecting){const e=s.target;e.src=e.dataset.src,e.classList.remove("lazy"),t.unobserve(e)}})});n.forEach(o=>t.observe(o))}else n.forEach(t=>{t.src=t.dataset.src,t.classList.remove("lazy")})});console.log("initializeDonationPage called");console.log("openModal function:",window.openModal);document.addEventListener("DOMContentLoaded",T);
//# sourceMappingURL=main-10bfba19.js.map

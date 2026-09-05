(()=>{
  const ORDER_EMAIL="Jae@signaturelooksinc.com";
  const TEXT_PHONE="646-339-9472";
  const CALL_PHONE="718-786-5516";
  const CART_KEY="signatureCollectionOrderCartV1";
  let lastFocus=null;
  let toastTimer;

  const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value)||0);
  const vendorActive=()=>typeof isVendorLoggedIn==="function"?isVendorLoggedIn():sessionStorage.getItem("signatureVendorAccess")==="granted";
  const productFor=name=>DATA.find(item=>item.name===name);
  const lineKey=line=>`${line.name}::${line.color}`;
  const safeQty=value=>Math.max(1,Math.min(999,Math.floor(Number(value)||1)));

  function fixCatalogAssetPaths(root=document){
    const githubPages=location.hostname.toLowerCase()==="signature-collection-ny.github.io";
    const logo=root.querySelector?.(".brand-logo")||document.querySelector(".brand-logo");
    if(logo){
      const logoSrc=logo.getAttribute("src")||"";
      if(githubPages&&logoSrc.includes("assets/brand/"))logo.setAttribute("src",logoSrc.split("/").pop().replace(/\.png$/i,".jpg"));
      else if(!githubPages&&logoSrc==="signature-official-logo.jpg")logo.setAttribute("src","assets/brand/signature-official-logo.png");
    }
    root.querySelectorAll?.(".card .photo img, .heroimg img").forEach(img=>{
      const src=img.getAttribute("src")||"";
      if(!src||/^(?:data:|blob:|https?:)/i.test(src))return;
      if(githubPages){
        const file=src.split("/").pop();
        const photo=img.closest(".photo");if(photo)photo.style.display="";
        if(src!==file)img.setAttribute("src",file);
        if(!img.dataset.githubFallback){
          img.dataset.githubFallback="ready";
          img.addEventListener("error",()=>{
            if(img.dataset.githubFallback!=="ready")return;
            img.dataset.githubFallback="tried";
            const current=img.getAttribute("src")||"";
            img.setAttribute("src",/\.png$/i.test(current)?current.replace(/\.png$/i,".jpg"):current.replace(/\.jpg$/i,".png"));
          });
        }
        return;
      }
      if(src.includes("assets/models/")||src.includes("assets/references/"))return;
      let file=src.split("/").pop();
      const folder=/-source\./i.test(file)?"references":"models";
      if(folder==="models"&&/-approved\.jpg$/i.test(file))file=file.replace(/\.jpg$/i,".png");
      const photo=img.closest(".photo");if(photo)photo.style.display="";
      img.setAttribute("src",`assets/${folder}/${file}`);
    });
  }

  function readCart(){
    try{
      const parsed=JSON.parse(localStorage.getItem(CART_KEY)||"[]");
      return Array.isArray(parsed)?parsed.filter(line=>line&&line.name&&line.color&&Number(line.price)>=0).map(line=>({...line,qty:safeQty(line.qty)})):[];
    }catch{return[]}
  }
  let cart=readCart();
  function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart()}
  function showToast(message){
    const toast=document.getElementById("orderToast");
    if(!toast)return;
    toast.textContent=message;toast.classList.add("show");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);
  }
  function requestVendorLogin(){
    if(typeof openVendorGate==="function")openVendorGate();
    else document.getElementById("vendorLoginButton")?.click();
  }
  function addLine(product,color,qty){
    if(!vendorActive()){requestVendorLogin();return}
    const price=Number(PRICES[product.name]);
    if(!Number.isFinite(price)){showToast("Price is not available for this style.");return}
    const line={id:product.id,name:product.name,color,qty:safeQty(qty),price};
    const existing=cart.find(item=>lineKey(item)===lineKey(line));
    if(existing)existing.qty=safeQty(existing.qty+line.qty);else cart.push(line);
    saveCart();showToast(`${product.name} added to the order.`);
  }
  function makeOrderControls(product,detail=false){
    const wrap=document.createElement("div");
    wrap.className="order-controls";wrap.dataset.orderProduct=product.name;wrap.dataset.orderMode=vendorActive()?"open":"locked";
    if(!vendorActive()){
      const button=document.createElement("button");
      button.type="button";button.className="order-add locked";button.textContent="VENDOR LOGIN TO ORDER";
      button.addEventListener("click",requestVendorLogin);wrap.appendChild(button);return wrap;
    }
    const colorLabel=document.createElement("label");colorLabel.textContent="COLOR";
    const select=document.createElement("select");select.setAttribute("aria-label",`${product.name} color`);
    product.colors.forEach(color=>{const option=document.createElement("option");option.value=color;option.textContent=color;if(color===product.shown)option.selected=true;select.appendChild(option)});
    colorLabel.appendChild(select);
    const qtyLabel=document.createElement("label");qtyLabel.textContent="QTY";
    const qty=document.createElement("input");qty.type="number";qty.min="1";qty.max="999";qty.value="1";qty.inputMode="numeric";qty.setAttribute("aria-label",`${product.name} quantity`);qtyLabel.appendChild(qty);
    const button=document.createElement("button");button.type="button";button.className="order-add";button.textContent=detail?`ADD ${money(PRICES[product.name])} TO ORDER`:`ADD TO ORDER · ${money(PRICES[product.name])}`;
    button.addEventListener("click",()=>addLine(product,select.value,qty.value));
    wrap.append(colorLabel,qtyLabel,button);return wrap;
  }
  function decorateOrderControls(root=document){
    const mode=vendorActive()?"open":"locked";
    root.querySelectorAll(".card").forEach(card=>{
      const name=card.querySelector(".name")?.textContent.trim();const product=productFor(name);if(!product)return;
      const current=card.querySelector(":scope > .order-controls");
      if(current?.dataset.orderMode===mode)return;
      current?.remove();card.appendChild(makeOrderControls(product));
    });
    root.querySelectorAll(".details").forEach(details=>{
      const name=details.querySelector("h2")?.textContent.trim();const product=productFor(name);if(!product)return;
      const current=details.querySelector(":scope > .order-controls");
      if(current?.dataset.orderMode===mode)return;
      current?.remove();const controls=makeOrderControls(product,true);
      const source=details.querySelector("a.source");source?source.before(controls):details.appendChild(controls);
    });
  }
  function ensureShell(){
    if(document.getElementById("orderCartOverlay"))return;
    const tools=document.querySelector(".account-tools")||document.querySelector(".bar");
    const trigger=document.createElement("button");trigger.type="button";trigger.id="orderCartTrigger";trigger.className="order-cart-trigger";trigger.setAttribute("aria-haspopup","dialog");trigger.innerHTML='ORDER <span class="order-cart-count" id="orderCartCount">0</span>';
    trigger.addEventListener("click",openCart);tools?.prepend(trigger);
    const overlay=document.createElement("div");overlay.id="orderCartOverlay";overlay.className="order-cart-overlay";overlay.setAttribute("aria-hidden","true");
    overlay.innerHTML=`<section class="order-cart-panel" role="dialog" aria-modal="true" aria-labelledby="orderCartTitle"><header class="order-cart-head"><h2 id="orderCartTitle">ORDER REQUEST</h2><button type="button" class="order-cart-close" aria-label="Close order request">×</button></header><div class="order-cart-body"><p class="order-cart-notice">Build your wholesale order request here. No payment is taken online. Signature Collection will confirm availability, shipping, tax, and the final total before processing.</p><div id="orderCartLines"></div><div class="order-total"><span>PRODUCT SUBTOTAL</span><span id="orderCartTotal">$0.00</span></div><form class="order-form" id="orderRequestForm"><h3 class="order-form-title">STORE & CONTACT INFORMATION</h3><div class="order-field"><label for="orderStore">STORE / BUSINESS NAME *</label><input id="orderStore" name="store" required autocomplete="organization"></div><div class="order-field"><label for="orderBuyer">BUYER NAME *</label><input id="orderBuyer" name="buyer" required autocomplete="name"></div><div class="order-field"><label for="orderEmail">EMAIL *</label><input id="orderEmail" name="email" type="email" required autocomplete="email"></div><div class="order-field"><label for="orderPhone">PHONE *</label><input id="orderPhone" name="phone" type="tel" required autocomplete="tel"></div><div class="order-field wide"><label for="orderAddress">SHIPPING / DELIVERY ADDRESS *</label><textarea id="orderAddress" name="address" required autocomplete="street-address"></textarea></div><div class="order-field wide"><label for="orderNotes">ORDER NOTES</label><textarea id="orderNotes" name="notes" placeholder="Delivery instructions or other requests"></textarea></div><div class="order-form-actions"><button class="order-submit" type="submit">EMAIL ORDER REQUEST</button><button class="order-copy" id="copyOrderButton" type="button">COPY ORDER DETAILS</button></div><p class="order-contact">Orders: <a href="mailto:${ORDER_EMAIL}">${ORDER_EMAIL}</a><br>Text <a href="sms:+16463399472">${TEXT_PHONE}</a> · Call <a href="tel:+17187865516">${CALL_PHONE}</a></p><p id="orderStatus" class="order-status" role="status" aria-live="polite"></p></form></div></section>`;
    document.body.appendChild(overlay);
    const toast=document.createElement("div");toast.id="orderToast";toast.className="order-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.appendChild(toast);
    overlay.querySelector(".order-cart-close").addEventListener("click",closeCart);
    overlay.addEventListener("click",event=>{if(event.target===overlay)closeCart()});
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&overlay.classList.contains("open"))closeCart()});
    document.getElementById("orderRequestForm").addEventListener("submit",submitOrder);
    document.getElementById("copyOrderButton").addEventListener("click",copyOrder);
    prefillVendor();renderCart();
  }
  function prefillVendor(){
    const store=document.getElementById("orderStore"),email=document.getElementById("orderEmail");
    if(store&&!store.value)store.value=sessionStorage.getItem("signatureVendorBusiness")||"";
    if(email&&!email.value)email.value=sessionStorage.getItem("signatureVendorEmail")||"";
  }
  function openCart(){
    ensureShell();lastFocus=document.activeElement;prefillVendor();renderCart();
    const overlay=document.getElementById("orderCartOverlay");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";overlay.querySelector(".order-cart-close").focus();
  }
  function closeCart(){
    const overlay=document.getElementById("orderCartOverlay");overlay?.classList.remove("open");overlay?.setAttribute("aria-hidden","true");document.body.style.overflow="";lastFocus?.focus?.();
  }
  function renderCart(){
    const count=cart.reduce((sum,line)=>sum+safeQty(line.qty),0);const subtotal=cart.reduce((sum,line)=>sum+(Number(line.price)*safeQty(line.qty)),0);
    const countNode=document.getElementById("orderCartCount");if(countNode)countNode.textContent=String(count);
    const total=document.getElementById("orderCartTotal");if(total)total.textContent=money(subtotal);
    const lines=document.getElementById("orderCartLines");if(!lines)return;
    lines.replaceChildren();
    if(!cart.length){const empty=document.createElement("div");empty.className="order-cart-empty";empty.textContent="Your order is empty. Choose a color and quantity from any catalog style.";lines.appendChild(empty);return}
    const list=document.createElement("div");list.className="order-lines";
    cart.forEach((line,index)=>{
      const item=document.createElement("article");item.className="order-line";
      const info=document.createElement("div");const name=document.createElement("div");name.className="order-line-name";name.textContent=line.name;const meta=document.createElement("div");meta.className="order-line-meta";meta.textContent=`Color: ${line.color} · Unit: ${money(line.price)}`;const price=document.createElement("div");price.className="order-line-price";price.textContent=`Line total: ${money(line.price*line.qty)}`;info.append(name,meta,price);
      const actions=document.createElement("div");actions.className="order-line-actions";
      const minus=document.createElement("button");minus.type="button";minus.className="order-qty-button";minus.setAttribute("aria-label",`Decrease ${line.name} quantity`);minus.textContent="−";minus.addEventListener("click",()=>changeQty(index,-1));
      const qty=document.createElement("span");qty.className="order-line-qty";qty.textContent=String(line.qty);
      const plus=document.createElement("button");plus.type="button";plus.className="order-qty-button";plus.setAttribute("aria-label",`Increase ${line.name} quantity`);plus.textContent="+";plus.addEventListener("click",()=>changeQty(index,1));
      const remove=document.createElement("button");remove.type="button";remove.className="order-remove";remove.setAttribute("aria-label",`Remove ${line.name}`);remove.textContent="×";remove.addEventListener("click",()=>{cart.splice(index,1);saveCart()});
      actions.append(minus,qty,plus,remove);item.append(info,actions);list.appendChild(item);
    });lines.appendChild(list);
  }
  function changeQty(index,amount){const line=cart[index];if(!line)return;line.qty+=amount;if(line.qty<1)cart.splice(index,1);saveCart()}
  function formValues(){
    const form=document.getElementById("orderRequestForm");const data=new FormData(form);
    return Object.fromEntries([...data.entries()].map(([key,value])=>[key,String(value).trim()]));
  }
  function orderText(values){
    const now=new Date();const ref=`SC-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(now.getHours()).padStart(2,"0")}${String(now.getMinutes()).padStart(2,"0")}`;
    const lines=cart.map((line,index)=>`${index+1}. ${line.name} | Color: ${line.color} | Qty: ${line.qty} | Unit: ${money(line.price)} | Line: ${money(line.price*line.qty)}`);
    const subtotal=cart.reduce((sum,line)=>sum+(line.price*line.qty),0);
    return [`SIGNATURE COLLECTION ORDER REQUEST`,`Reference: ${ref}`,`Date: ${now.toLocaleString("en-US",{timeZone:"America/New_York"})} ET`,"",`Store / Business: ${values.store}`,`Buyer: ${values.buyer}`,`Email: ${values.email}`,`Phone: ${values.phone}`,`Shipping / Delivery Address: ${values.address}`,"","ORDER ITEMS",...lines,"",`Product subtotal: ${money(subtotal)}`,"",`Notes: ${values.notes||"None"}`,"","This is an order request, not a completed payment. Please confirm product availability, color availability, shipping, tax, and the final total."].join("\n");
  }
  async function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return}
    const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();document.execCommand("copy");area.remove();
  }
  async function copyOrder(){
    const form=document.getElementById("orderRequestForm"),status=document.getElementById("orderStatus");
    if(!cart.length){status.textContent="Add at least one product before copying the order.";return}
    if(!form.reportValidity())return;
    try{await copyText(orderText(formValues()));status.textContent="Order details copied. You can paste them into email or text."}catch{status.textContent=`Could not copy automatically. Please email ${ORDER_EMAIL}.`}
  }
  function submitOrder(event){
    event.preventDefault();const status=document.getElementById("orderStatus");
    if(!cart.length){status.textContent="Add at least one product before sending the order request.";return}
    const values=formValues(),body=orderText(values),subject=`Signature Collection Order Request - ${values.store}`;
    copyText(body).catch(()=>{});status.textContent="Your email app is opening. Review the order and press Send to submit it.";
    window.location.href=`mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function refresh(){ensureShell();fixCatalogAssetPaths();decorateOrderControls()}
  const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{refresh();observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]})},{once:true});
  else{refresh();observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]})}
})();

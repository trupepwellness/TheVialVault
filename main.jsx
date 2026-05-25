import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// ── COLORS ────────────────────────────────────────────────────────────────────
const RG = '#C4856A', RG_LT = '#E8C5B8', RG_DK = '#9E6048';
const BURG = '#7B3345', MAUVE = '#A0637A';
const BG = '#FBF0EE', SURFACE = '#FFFAF8', WHITE = '#FFFFFF';
const BLUSH = '#F0D8D0', TEXT = '#3D1A28', TEXT_M = '#8B6070';
const BORDER = 'rgba(196,133,106,0.22)';

// ── BUSINESS ──────────────────────────────────────────────────────────────────
const BIZ = {
  name: 'The Vial Vault',
  email: 'TheVialVault843@gmail.com',
  phone: '843-420-0420',
  location: 'Murrells Inlet, South Carolina',
  zelle: '843-420-0420',
  venmo: '@Teri-Salvino',
  formId: 'mqejyqov',
};

// ── PRODUCTS (TruPep pricing minus $5 per variant) ────────────────────────────
const PRODS = [
  {
    id:'reta', name:'Retatrutide', cat:'Weight Management',
    desc:'Next-generation triple receptor agonist (GLP-1, GIP & Glucagon) researched for advanced metabolic support and body composition optimization.',
    tags:['GLP-1/GIP/Glucagon agonist','Appetite regulation research','Fat mobilization studies','Metabolic wellness'],
    variants:[{mg:'10mg',price:95},{mg:'20mg',price:135},{mg:'30mg',price:165}],
    badge:'Best Seller',
  },
  {
    id:'tirz', name:'Tirzepatide', cat:'Weight Management',
    desc:'Dual GLP-1 and GIP receptor agonist widely researched for glucose metabolism support, insulin sensitivity, and body composition optimization.',
    tags:['Dual GLP-1/GIP receptor','Insulin sensitivity','Glycemic support research','Body composition'],
    variants:[{mg:'15mg',price:75},{mg:'20mg',price:95},{mg:'30mg',price:115}],
  },
  {
    id:'amino', name:'5 Amino 1MQ', cat:'Metabolism',
    desc:'Researched for NNMT (nicotinamide N-methyltransferase) inhibition — a pathway studied in longevity, fat cell regulation, and metabolic optimization.',
    tags:['NNMT inhibition research','Fat cell regulation','Longevity pathway','Metabolic optimization'],
    variants:[{mg:'50mg',price:100}],
  },
  {
    id:'mots', name:'MOTS-C', cat:'Longevity & Energy',
    desc:'A mitochondrial-derived peptide researched for energy regulation, metabolic balance, cellular longevity, and exercise capacity support.',
    tags:['Mitochondrial health','Energy regulation research','Metabolic balance','Longevity studies'],
    variants:[{mg:'10mg',price:95},{mg:'40mg',price:175}],
  },
  {
    id:'nad', name:'NAD+', cat:'Longevity & Energy',
    desc:'Nicotinamide Adenine Dinucleotide — a critical coenzyme researched for cellular energy production, DNA repair, mitochondrial health, and anti-aging pathways.',
    tags:['Cellular energy research','DNA repair pathway','Mitochondrial support','Anti-aging studies'],
    variants:[{mg:'500mg',price:95},{mg:'1000mg',price:125}],
  },
  {
    id:'klow', name:'KLOW Blend', cat:'Weight Management',
    desc:'The Vial Vault\'s exclusive 80mg metabolic blend — a synergistic multi-peptide formula designed for comprehensive metabolic wellness research.',
    tags:['Exclusive VV blend','Multi-pathway support','Metabolic research','80mg formula'],
    variants:[{mg:'80mg',price:155}],
    badge:'Exclusive',
  },
  {
    id:'glow', name:'GLOW Blend', cat:'Aesthetics & Skin',
    desc:'Our exclusive 70mg beauty & recovery blend — combining multiple peptides researched for skin radiance, collagen support, and cellular renewal.',
    tags:['Exclusive VV blend','Collagen synthesis research','Skin radiance studies','Cellular renewal'],
    variants:[{mg:'70mg',price:135}],
    badge:'Exclusive',
  },
  {
    id:'mt1', name:'MT-1', cat:'Aesthetics & Skin',
    desc:'Melanotan I — a melanocortin receptor agonist researched for its role in skin pigmentation, melanin production, and UV response pathways.',
    tags:['Melanocortin agonist','Skin pigmentation research','Melanin production','UV response pathway'],
    variants:[{mg:'10mg',price:80}],
  },
  {
    id:'pt141', name:'PT-141', cat:'Wellness & Vitality',
    desc:'Bremelanotide — a melanocortin receptor agonist researched for vitality, hormonal wellness, and central nervous system melanocortin pathway studies.',
    tags:['CNS melanocortin pathway','Vitality research','Hormonal wellness','Melanocortin studies'],
    variants:[{mg:'10mg',price:70}],
  },
  {
    id:'ghkcu', name:'GHK-Cu', cat:'Aesthetics & Skin',
    desc:'A naturally occurring copper peptide complex researched for collagen synthesis, skin firmness, wound healing support, and hair follicle studies.',
    tags:['Collagen synthesis research','Skin firmness studies','Wound healing support','Hair follicle research'],
    variants:[{mg:'50mg',price:70},{mg:'100mg',price:90}],
  },
  {
    id:'bpc', name:'BPC-157', cat:'Recovery & Repair',
    desc:'A pentadecapeptide extensively studied for cellular and tissue repair. Researched for tendon recovery, gut health, and anti-inflammatory properties.',
    tags:['Tissue repair research','Gut health studies','Anti-inflammatory','Tendon & ligament recovery'],
    variants:[{mg:'10mg',price:70}],
  },
  {
    id:'bac', name:'BAC Water', cat:'Supplies',
    desc:'Bacteriostatic water — required for reconstituting all lyophilized peptide vials. Sterile and multi-dose safe.',
    tags:['Peptide reconstitution','Multi-dose safe','Sterile water','Essential supply'],
    variants:[{mg:'30ml',price:22}],
  },
  {
    id:'syr', name:'Syringes', cat:'Supplies',
    desc:'U-100 insulin syringes for accurate peptide dosing. Single-use, sterile. Pack of 10. Required for all subcutaneous research protocols.',
    tags:['U-100 insulin syringes','Pack of 10','Single-use sterile','Accurate dosing'],
    variants:[{mg:'Pk of 10',price:12}],
  },
];

const CATS = ['All',...new Set(PRODS.map(p=>p.cat))];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const ls = { get:k=>{try{return localStorage.getItem(k)}catch{return null}}, set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}} };
const Lbl = ({children,style={}})=><div style={{fontSize:9,letterSpacing:4,color:RG,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600,...style}}>{children}</div>;
const Div = ()=><div style={{width:40,height:1,background:RG,margin:'12px auto'}}/>;
const Btn = ({onClick,children,style={},disabled})=>(
  <button onClick={onClick} disabled={disabled} className="btn-rg"
    style={{padding:'12px 24px',background:`linear-gradient(135deg,${RG},${RG_DK})`,color:WHITE,border:'none',fontFamily:'Raleway,sans-serif',fontSize:10.5,letterSpacing:2.5,textTransform:'uppercase',cursor:disabled?'not-allowed':'pointer',fontWeight:700,opacity:disabled?0.6:1,...style}}>
    {children}
  </button>
);

// ── COOKIE BANNER ─────────────────────────────────────────────────────────────
function CookieBanner({onAccept,setPage}){
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:8000,background:BURG,borderTop:`2px solid ${RG}`,padding:"12px 20px",display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,justifyContent:"space-between"}}>
      <p style={{fontSize:11.5,color:"rgba(255,255,255,0.82)",fontFamily:"Raleway,sans-serif",fontWeight:300,margin:0,flex:1,minWidth:200}}>
        We use essential cookies for age verification and preferences.{" "}
        <span onClick={()=>setPage("privacy")} style={{color:RG_LT,textDecoration:"underline",cursor:"pointer"}}>Privacy Policy</span>
      </p>
      <button onClick={onAccept} style={{padding:"8px 20px",background:RG,color:WHITE,border:"none",fontFamily:"Raleway,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontWeight:600}}>
        Accept & Continue
      </button>
    </div>
  );
}

// ── AGE GATE ──────────────────────────────────────────────────────────────────
function AgeGate({onOk}){
  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(63,26,40,0.97)',backdropFilter:'blur(14px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn 0.3s ease'}}>
      <div style={{maxWidth:440,width:'100%',background:SURFACE,padding:'48px 36px',textAlign:'center',borderTop:`3px solid ${RG}`,borderBottom:`3px solid ${RG}`,animation:'fadeInUp 0.4s ease'}}>
        <div style={{fontSize:36,marginBottom:16,animation:'roseGlow 3s infinite'}}>🔒</div>
        <Lbl style={{marginBottom:8}}>The Vial Vault</Lbl>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:BURG,fontWeight:400,marginBottom:8}}>Age Verification Required</h2>
        <Div/>
        <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.85,marginBottom:24}}>
          This site contains research peptide information for adults <strong style={{color:BURG}}>18+</strong>. All products are for <strong style={{color:BURG}}>research & educational purposes only</strong>. Not for human consumption.
        </p>
        <Btn onClick={onOk} style={{width:'100%',marginBottom:10}}>I Am 18 Or Older — Enter</Btn>
        <button onClick={()=>window.location.href='https://google.com'} style={{width:'100%',padding:'11px',background:'transparent',color:TEXT_M,border:`1px solid ${BORDER}`,fontFamily:'Raleway,sans-serif',fontSize:10.5,letterSpacing:2,textTransform:'uppercase',cursor:'pointer'}}>
          I Am Under 18 — Exit
        </button>
      </div>
    </div>
  );
}

// ── EMAIL POPUP ───────────────────────────────────────────────────────────────
function Popup({onClose}){
  const [em,setEm]=useState('');
  const [done,setDone]=useState(false);
  const sub=async()=>{
    if(!em.includes('@'))return;
    ls.set('vv_sub',em);
    await new Promise(r=>setTimeout(r,700));
    setDone(true);
    setTimeout(onClose,2800);
  };
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:8500,background:'rgba(63,26,40,0.6)',backdropFilter:'blur(5px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:'100%',background:SURFACE,padding:'42px 32px',textAlign:'center',borderTop:`3px solid ${RG}`,position:'relative',animation:'fadeInUp 0.35s ease'}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:14,background:'none',border:'none',fontSize:18,color:TEXT_M,cursor:'pointer'}}>✕</button>
        {!done?(
          <>
            <div style={{fontSize:30,marginBottom:12}}>🌸</div>
            <Lbl style={{marginBottom:6}}>Welcome to The Vial Vault</Lbl>
            <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,color:BURG,fontWeight:400,marginBottom:6}}>10% Off Your First Order</h3>
            <Div/>
            <p style={{fontSize:12,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8,marginBottom:16}}>
              Sign up for exclusive deals & research updates. Use <strong style={{color:BURG}}>VAULT10</strong> at checkout.
            </p>
            <input type="email" placeholder="Your email address" value={em} onChange={e=>setEm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sub()}
              style={{width:'100%',padding:'11px 12px',border:`1px solid ${BORDER}`,background:BG,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:10}}/>
            <Btn onClick={sub} style={{width:'100%'}}>Claim My 10% Off</Btn>
            <p style={{fontSize:9.5,color:TEXT_M,marginTop:8,fontFamily:'Raleway,sans-serif'}}>No spam. Unsubscribe anytime.</p>
          </>
        ):(
          <>
            <div style={{fontSize:36,marginBottom:10,animation:'floatAnim 2s infinite'}}>✦</div>
            <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:BURG,fontWeight:400,marginBottom:8}}>You're In the Vault!</h3>
            <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif'}}>Code: <strong style={{color:BURG,fontSize:16}}>VAULT10</strong> — 10% off your first order.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav({page,go,cartQty,openCart}){
  const [mob,setMob]=useState(false);
  const [res,setRes]=useState(false);
  const [leg,setLeg]=useState(false);
  const nl=(lbl,p)=>(
    <button onClick={()=>{go(p);setMob(false)}} style={{background:'none',border:'none',color:page===p?RG:TEXT,fontFamily:'Raleway,sans-serif',fontSize:10.5,letterSpacing:2.5,textTransform:'uppercase',cursor:'pointer',fontWeight:page===p?700:500,padding:'4px 0'}}>
      {lbl}
    </button>
  );
  const DD=({lbl,items,open,setOpen})=>{
    const active=items.some(([,p])=>p===page);
    return(
      <div style={{position:'relative'}} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
        <button style={{background:'none',border:'none',color:active?RG:TEXT,fontFamily:'Raleway,sans-serif',fontSize:10.5,letterSpacing:2.5,textTransform:'uppercase',cursor:'pointer',fontWeight:active?700:500,display:'flex',alignItems:'center',gap:5}}>
          {lbl} <span style={{fontSize:8}}>▾</span>
        </button>
        {open&&(
          <div style={{position:'absolute',top:'100%',left:0,background:WHITE,border:`1px solid ${BORDER}`,borderTop:`2px solid ${RG}`,minWidth:175,padding:'6px 0',boxShadow:'0 8px 28px rgba(0,0,0,0.1)',zIndex:500,animation:'slideDown 0.18s ease'}}>
            {items.map(([l,p])=>(
              <button key={p} onClick={()=>{go(p);setOpen(false)}} style={{display:'block',width:'100%',textAlign:'left',padding:'10px 16px',background:'none',border:'none',color:page===p?RG:TEXT,fontFamily:'Raleway,sans-serif',fontSize:10,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',fontWeight:page===p?700:400}}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };
  return(
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(251,240,238,0.96)',backdropFilter:'blur(14px)',borderBottom:`1px solid ${BORDER}`,height:62,display:'flex',alignItems:'center',padding:'0 24px',justifyContent:'space-between'}}>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${RG},${RG_LT},${RG},transparent)`,backgroundSize:'300% 100%',animation:'shimmer 8s linear infinite',opacity:0.7}}/>
      {/* Logo */}
      <button onClick={()=>go('home')} style={{background:'none',border:'none',cursor:'pointer',textAlign:'left',padding:0,flexShrink:0}}>
        <div className="nav-logo-main">
          The <span className="shimmer-text" style={{fontStyle:'italic'}}>Vial Vault</span>
        </div>
        <div className="nav-logo-sub">Premium Peptides · SC</div>
      </button>
      {/* Desktop */}
      <div className="desk-nav" style={{display:'flex',alignItems:'center',gap:26}}>
        {nl('Home','home')}
        {nl('Products','products')}
        <DD lbl="Resources" items={[['Calculator','calc'],['How To Use','howto'],['Safety','safety']]} open={res} setOpen={setRes}/>
        <DD lbl="Legal" items={[['Privacy','privacy'],['Terms','terms'],['Disclaimer','disclaimer'],['Refund Policy','refund']]} open={leg} setOpen={setLeg}/>
        {nl('Contact','contact')}
      </div>
      {/* Icons */}
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={openCart} style={{background:'none',border:'none',cursor:'pointer',position:'relative',padding:4,display:'flex',alignItems:'center'}}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartQty>0&&<span style={{position:'absolute',top:-5,right:-5,width:16,height:16,borderRadius:'50%',background:RG,color:WHITE,fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontFamily:'Raleway,sans-serif'}}>{cartQty}</span>}
        </button>
        <button onClick={()=>setMob(!mob)} className="hamburger" style={{background:'none',border:'none',cursor:'pointer',flexDirection:'column',gap:4.5,padding:4}}>
          {[0,1,2].map(i=><div key={i} style={{width:22,height:1.5,background:TEXT_M}}/>)}
        </button>
      </div>
      {/* Mobile menu */}
      {mob&&(
        <div style={{position:'absolute',top:62,left:0,right:0,background:WHITE,borderBottom:`2px solid ${RG}`,padding:'10px 24px 16px',boxShadow:'0 8px 24px rgba(0,0,0,0.09)',animation:'slideDown 0.2s ease',maxHeight:'80vh',overflowY:'auto'}}>
          {[['Home','home'],['Products','products'],['Calculator','calc'],['How To Use','howto'],['Safety','safety'],['Contact','contact'],['Privacy','privacy'],['Terms','terms'],['Disclaimer','disclaimer'],['Refund Policy','refund']].map(([l,p])=>(
            <button key={p} onClick={()=>{go(p);setMob(false)}} style={{display:'block',width:'100%',background:'none',border:'none',textAlign:'left',color:page===p?RG:TEXT,fontFamily:'Raleway,sans-serif',fontSize:11,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',fontWeight:page===p?700:400,padding:'11px 0',borderBottom:`1px solid ${BLUSH}`}}>
              {l}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── CART ──────────────────────────────────────────────────────────────────────
function Cart({cart,setCart,open,onClose,go}){
  const CODES={VAULT10:10,VAULT15:15,VIP20:20,FRIEND25:25};
  const [code,setCode]=useState('');
  const [disc,setDisc]=useState(0);
  const [discLbl,setDiscLbl]=useState('');
  const [step,setStep]=useState('cart');
  const [form,setForm]=useState({name:'',email:'',phone:'',address:'',city:'',state:'SC',zip:''});
  const [busy,setBusy]=useState(false);
  const [num,setNum]=useState('');
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const discAmt=Math.round(sub*disc/100);
  const total=sub-discAmt;
  const upd=(id,mg,d)=>setCart(c=>c.map(i=>i.id===id&&i.mg===mg?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const applyCode=()=>{const c=code.trim().toUpperCase();CODES[c]?(setDisc(CODES[c]),setDiscLbl(c)):setDiscLbl('BAD');};
  const place=async()=>{
    if(!form.name||!form.email||!form.address)return;
    setBusy(true);
    const n='VV-'+Date.now().toString().slice(-6);setNum(n);
    const fd=new FormData();
    fd.append('Order',n);fd.append('Name',form.name);fd.append('Email',form.email);fd.append('Phone',form.phone);
    fd.append('Address',`${form.address}, ${form.city}, ${form.state} ${form.zip}`);
    fd.append('Items',cart.map(i=>`${i.name} ${i.mg} x${i.qty}=$${i.price*i.qty}`).join(' | '));
    fd.append('Total',`$${total}`);fd.append('Discount',discLbl&&discLbl!=='BAD'?`${discLbl} -$${discAmt}`:'None');
    fd.append('_subject',`New Order #${n} — The Vial Vault`);
    try{await fetch(`https://formspree.io/f/${BIZ.formId}`,{method:'POST',body:fd})}catch{}
    setBusy(false);setCart([]);setStep('confirm');
  };
  if(!open)return null;
  const Fld=({l,k,t='text'})=>(
    <div style={{marginBottom:10}}>
      <label style={{display:'block',fontSize:9,letterSpacing:2,color:TEXT_M,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:3}}>{l}</label>
      <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        style={{width:'100%',padding:'10px 11px',border:`1px solid ${BORDER}`,background:BG,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
    </div>
  );
  return(
    <div style={{position:'fixed',inset:0,zIndex:9000,display:'flex',animation:'fadeIn 0.25s ease'}}>
      <div onClick={onClose} style={{flex:1,background:'rgba(63,26,40,0.45)',backdropFilter:'blur(4px)'}}/>
      <div style={{width:'min(400px,100vw)',background:SURFACE,display:'flex',flexDirection:'column',boxShadow:'-10px 0 40px rgba(0,0,0,0.13)'}}>
        <div style={{padding:'18px 22px',borderBottom:`1px solid ${BORDER}`,borderTop:`3px solid ${RG}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:21,color:BURG,fontWeight:400}}>
            {step==='cart'?'Your Cart':step==='checkout'?'Checkout':'Order Confirmed ✦'}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,color:TEXT_M,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
          {step==='cart'&&(cart.length===0?(
            <div style={{textAlign:'center',paddingTop:60}}>
              <div style={{fontSize:44,marginBottom:14}}>🔒</div>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:BURG}}>Your vault is empty</p>
              <Btn onClick={()=>{onClose();go('products')}} style={{marginTop:20}}>Browse Products</Btn>
            </div>
          ):(
            <>
              {cart.map(i=>(
                <div key={`${i.id}-${i.mg}`} style={{display:'flex',gap:10,alignItems:'center',padding:'12px 0',borderBottom:`1px solid ${BLUSH}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:16,color:BURG}}>{i.name}</div>
                    <div style={{fontSize:11,color:TEXT_M,fontFamily:'Raleway,sans-serif'}}>{i.mg} · ${i.price}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <button onClick={()=>upd(i.id,i.mg,-1)} style={{width:24,height:24,borderRadius:'50%',border:`1px solid ${BORDER}`,background:'none',cursor:'pointer',fontSize:15,color:BURG}}>−</button>
                    <span style={{fontFamily:'Raleway,sans-serif',fontWeight:600,minWidth:16,textAlign:'center'}}>{i.qty}</span>
                    <button onClick={()=>upd(i.id,i.mg,1)} style={{width:24,height:24,borderRadius:'50%',border:`1px solid ${BORDER}`,background:'none',cursor:'pointer',fontSize:15,color:BURG}}>+</button>
                  </div>
                  <div style={{fontFamily:'Raleway,sans-serif',fontWeight:600,color:BURG,minWidth:40,textAlign:'right'}}>${i.price*i.qty}</div>
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:14}}>
                <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Promo code" onKeyDown={e=>e.key==='Enter'&&applyCode()}
                  style={{flex:1,padding:'9px 11px',border:`1px solid ${BORDER}`,background:BG,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:12,outline:'none'}}/>
                <Btn onClick={applyCode} style={{padding:'9px 14px',fontSize:9.5,letterSpacing:1.5}}>Apply</Btn>
              </div>
              {discLbl&&discLbl!=='BAD'&&<p style={{fontSize:11,color:'#2e7d32',marginTop:4,fontFamily:'Raleway,sans-serif'}}>✓ {discLbl} — {disc}% off!</p>}
              {discLbl==='BAD'&&<p style={{fontSize:11,color:'#c0392b',marginTop:4,fontFamily:'Raleway,sans-serif'}}>Invalid code — try VAULT10</p>}
              <div style={{marginTop:14,padding:14,background:BLUSH,borderLeft:`3px solid ${RG}`}}>
                {disc>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontFamily:'Raleway,sans-serif',color:'#2e7d32',marginBottom:4}}><span>Discount ({disc}%)</span><span>−${discAmt}</span></div>}
                <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Cormorant Garamond,serif',fontSize:22,color:BURG}}>
                  <span>Total</span><span>${total}</span>
                </div>
              </div>
              <Btn onClick={()=>setStep('checkout')} style={{width:'100%',marginTop:14}}>Proceed to Checkout</Btn>
              <p style={{fontSize:9.5,color:TEXT_M,marginTop:7,textAlign:'center',fontFamily:'Raleway,sans-serif'}}>Research use only · All sales final · 18+</p>
            </>
          ))}
          {step==='checkout'&&(
            <div>
              <button onClick={()=>setStep('cart')} style={{background:'none',border:'none',color:RG,fontFamily:'Raleway,sans-serif',fontSize:10,letterSpacing:2,textTransform:'uppercase',cursor:'pointer',marginBottom:16,padding:0}}>← Back</button>
              <Fld l="Full Name *" k="name"/><Fld l="Email *" k="email" t="email"/><Fld l="Phone" k="phone" t="tel"/>
              <Fld l="Street Address *" k="address"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><Fld l="City" k="city"/><Fld l="ZIP" k="zip"/></div>
              <Fld l="State" k="state"/>
              <div style={{padding:12,background:BLUSH,borderLeft:`3px solid ${RG}`,margin:'12px 0',fontSize:11.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.75}}>
                By placing this order you confirm you are <strong style={{color:BURG}}>18+</strong> and that all products are for <strong style={{color:BURG}}>research purposes only</strong>.
              </div>
              <Btn onClick={place} disabled={busy||!form.name||!form.email||!form.address} style={{width:'100%'}}>
                {busy?'Placing Order...':'Place Order — $'+total}
              </Btn>
            </div>
          )}
          {step==='confirm'&&(
            <div style={{textAlign:'center',paddingTop:24,animation:'fadeInUp 0.4s ease'}}>
              <div style={{fontSize:44,marginBottom:12,animation:'floatAnim 2.5s infinite'}}>✦</div>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:BURG,fontWeight:400,marginBottom:8}}>Order Received!</h3>
              <p style={{fontSize:12,color:TEXT_M,fontFamily:'Raleway,sans-serif',lineHeight:1.8,marginBottom:18}}>Order <strong style={{color:BURG}}>#{num}</strong> confirmed. Confirmation sent to {form.email}.</p>
              <div style={{background:BLUSH,padding:18,borderLeft:`4px solid ${RG}`,textAlign:'left',marginBottom:16}}>
                <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:BURG,marginBottom:10}}>Send Payment: <strong>${total}</strong></div>
                {[['Zelle',BIZ.zelle],['Venmo',BIZ.venmo]].map(([m,h])=>(
                  <div key={m} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${BORDER}`,fontSize:12,fontFamily:'Raleway,sans-serif'}}>
                    <span style={{color:TEXT_M}}>{m}</span><strong style={{color:BURG}}>{h}</strong>
                  </div>
                ))}
                <p style={{fontSize:10.5,color:TEXT_M,marginTop:10,fontFamily:'Raleway,sans-serif',lineHeight:1.7}}>
                  Include order # <strong>{num}</strong> in your payment note. Processed 1–3 business days after payment.
                </p>
              </div>
              <button onClick={()=>{onClose();setStep('cart');}} style={{padding:'11px 28px',background:`linear-gradient(135deg,${RG},${RG_DK})`,color:WHITE,border:'none',fontFamily:'Raleway,sans-serif',fontSize:10,letterSpacing:2,textTransform:'uppercase',cursor:'pointer'}}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProdCard({p,addCart}){
  const [mg,setMg]=useState(p.variants[0].mg);
  const [added,setAdded]=useState(false);
  const v=p.variants.find(x=>x.mg===mg)||p.variants[0];
  const add=()=>{addCart({id:p.id,name:p.name,mg,price:v.price,qty:1});setAdded(true);setTimeout(()=>setAdded(false),1800);};
  return(
    <div className="product-card" style={{background:WHITE,border:`1px solid ${BORDER}`,display:'flex',flexDirection:'column',boxShadow:'0 2px 10px rgba(0,0,0,0.04)'}}>
      <div style={{height:3,background:`linear-gradient(90deg,${RG},${RG_LT},${RG})`,backgroundSize:'200% 100%',animation:'shimmer 8s linear infinite'}}/>
      <div style={{padding:'20px 18px',flex:1}}>
        {p.badge&&<div style={{display:'inline-block',background:BLUSH,color:BURG,fontSize:8.5,letterSpacing:2,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:700,padding:'3px 9px',marginBottom:9}}>{p.badge}</div>}
        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:21,color:BURG,fontWeight:400,marginBottom:3}}>{p.name}</div>
        <div style={{fontSize:8.5,letterSpacing:2,color:RG,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600,marginBottom:10}}>{p.cat}</div>
        <p style={{fontSize:12,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.75,marginBottom:12}}>{p.desc}</p>
        <div style={{marginBottom:14}}>
          {p.tags.slice(0,3).map(t=>(
            <div key={t} style={{display:'flex',gap:6,marginBottom:4,alignItems:'flex-start'}}>
              <span style={{color:RG,fontSize:7,marginTop:5}}>◆</span>
              <span style={{fontSize:11,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300}}>{t}</span>
            </div>
          ))}
        </div>
        {p.variants.length>1&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:8.5,letterSpacing:2,color:TEXT_M,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600,marginBottom:6}}>Select Size</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {p.variants.map(v=>(
                <button key={v.mg} onClick={()=>setMg(v.mg)} style={{padding:'5px 12px',background:mg===v.mg?RG:'transparent',color:mg===v.mg?WHITE:BURG,border:`1px solid ${mg===v.mg?RG:BORDER}`,fontFamily:'Raleway,sans-serif',fontSize:11,cursor:'pointer',fontWeight:mg===v.mg?700:400,transition:'all 0.2s'}}>
                  {v.mg}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{padding:'10px 18px 16px',borderTop:`1px solid ${BLUSH}`,display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
        <div>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,color:BURG,fontWeight:500}}>${v.price}</div>
          <div style={{fontSize:9.5,color:TEXT_M,fontFamily:'Raleway,sans-serif'}}>{mg} vial</div>
        </div>
        <button onClick={add} className="btn-rg" style={{padding:'9px 16px',background:added?'#2e7d32':`linear-gradient(135deg,${RG},${RG_DK})`,color:WHITE,border:'none',fontFamily:'Raleway,sans-serif',fontSize:9.5,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',fontWeight:700,transition:'all 0.3s',minWidth:96}}>
          {added?'✓ Added!':'Add to Cart'}
        </button>
      </div>
      <p style={{fontSize:9,color:TEXT_M,textAlign:'center',padding:'0 18px 10px',fontFamily:'Raleway,sans-serif'}}>Research purposes only · 18+</p>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({go}){
  return(
    <footer style={{background:BURG,padding:'48px 24px 22px'}}>
      <div style={{maxWidth:1060,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:32,marginBottom:36}}>
          <div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:WHITE,marginBottom:4}}>The <span className="shimmer-text" style={{fontStyle:'italic'}}>Vial Vault</span></div>
            <div style={{fontSize:7.5,letterSpacing:3,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:12,fontWeight:600}}>Premium Peptides · SC</div>
            <p style={{fontSize:11.5,color:'rgba(255,255,255,0.55)',fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.85}}>Science you can trust. Results you can see. Third-party tested, cold chain protected.</p>
          </div>
          <div>
            <div style={{fontSize:8.5,letterSpacing:3,color:RG_LT,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:14,fontWeight:700}}>Shop & Resources</div>
            {[['Home','home'],['Products','products'],['Calculator','calc'],['How To Use','howto'],['Safety','safety'],['Contact','contact']].map(([l,p])=>(
              <button key={p} onClick={()=>go(p)} style={{display:'block',background:'none',border:'none',color:'rgba(255,255,255,0.6)',fontFamily:'Raleway,sans-serif',fontSize:11,cursor:'pointer',padding:'3px 0',textAlign:'left'}}>{l}</button>
            ))}
          </div>
          <div>
            <div style={{fontSize:8.5,letterSpacing:3,color:RG_LT,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:14,fontWeight:700}}>Legal</div>
            {[['Privacy Policy','privacy'],['Terms of Service','terms'],['Research Disclaimer','disclaimer'],['Refund & Shipping','refund']].map(([l,p])=>(
              <button key={p} onClick={()=>go(p)} style={{display:'block',background:'none',border:'none',color:'rgba(255,255,255,0.6)',fontFamily:'Raleway,sans-serif',fontSize:11,cursor:'pointer',padding:'3px 0',textAlign:'left'}}>{l}</button>
            ))}
          </div>
          <div>
            <div style={{fontSize:8.5,letterSpacing:3,color:RG_LT,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:14,fontWeight:700}}>Contact</div>
            <p style={{fontSize:11.5,color:'rgba(255,255,255,0.6)',fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:2.1}}>
              📧 {BIZ.email}<br/>📞 {BIZ.phone}<br/>📍 {BIZ.location}<br/>💸 Zelle: {BIZ.zelle}<br/>📱 Venmo: {BIZ.venmo}
            </p>
          </div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',paddingTop:18,textAlign:'center'}}>
          <p style={{fontSize:10,color:'rgba(255,255,255,0.3)',fontFamily:'Raleway,sans-serif',lineHeight:1.85}}>
            ⚠️ All products are for research & educational purposes only. Not for human consumption. Not evaluated by the FDA. Must be 18+ to purchase.<br/>
            © {new Date().getFullYear()} The Vial Vault · Murrells Inlet, South Carolina
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function Home({go,addCart}){
  const trust=[['⬡','Premium Peptides','Pharmaceutical-grade purity'],['✓','Third-Party Tested','Independent verification'],['❄','Cold Chain Protected','Temperature-controlled shipping'],['♡','Fast & Reliable','1–3 business day processing']];
  return(
    <div style={{paddingTop:62}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 55%,rgba(196,133,106,0.06) 100%)`,minHeight:'88vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:420,height:420,borderRadius:'50%',background:`radial-gradient(circle,rgba(196,133,106,0.1) 0%,transparent 70%)`,top:-80,right:-80,pointerEvents:'none',animation:'orbFloat 12s ease-in-out infinite'}}/>
        <div style={{maxWidth:700,animation:'fadeInUp 0.7s ease'}}>
          <Lbl style={{fontSize:10,marginBottom:18,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <span style={{width:32,height:1,background:RG,display:'inline-block'}}/>
            Science You Can Trust. Results You Can See.
            <span style={{width:32,height:1,background:RG,display:'inline-block'}}/>
          </Lbl>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(52px,8vw,92px)',fontWeight:400,lineHeight:1,marginBottom:18,letterSpacing:-1}}>
            <span style={{color:BURG}}>The </span><span className="shimmer-text">Vial</span><br/>
            <span style={{color:BURG,fontStyle:'italic'}}>Vault</span>
          </h1>
          <Div/>
          <p style={{fontSize:14.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:500,margin:'0 auto 32px',lineHeight:2}}>
            Premium research peptides — protected with care. Purity, potency, and performance you can trust.
          </p>
          <div className="hero-btns" style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Btn onClick={()=>go('products')}>Shop the Vault</Btn>
            <button onClick={()=>go('calc')} style={{padding:'12px 28px',background:'transparent',color:BURG,border:`1.5px solid ${RG}`,fontSize:10.5,letterSpacing:3,textTransform:'uppercase',cursor:'pointer',fontFamily:'Raleway,sans-serif',fontWeight:600}}>
              Peptide Calculator
            </button>
          </div>
          <p style={{fontSize:10,color:TEXT_M,marginTop:18,fontFamily:'Raleway,sans-serif',letterSpacing:1}}>Use code <strong style={{color:BURG}}>VAULT10</strong> — 10% off your first order</p>
        </div>
      </div>
      {/* Trust badges */}
      <div style={{background:WHITE,borderTop:`1px solid ${BORDER}`,borderBottom:`1px solid ${BORDER}`}}>
        <div className='trust-grid' style={{maxWidth:1060,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))'}}>
          {trust.map(([icon,lbl,desc],i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'20px 16px',borderRight:i<trust.length-1?`1px solid ${BORDER}`:'none'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:BLUSH,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:RG,flexShrink:0,animation:`roseGlow 3.5s ease-in-out infinite`,animationDelay:`${i*0.5}s`}}>{icon}</div>
              <div>
                <div style={{fontSize:10,letterSpacing:1.5,color:BURG,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:700,marginBottom:2}}>{lbl}</div>
                <div style={{fontSize:11,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Featured */}
      <div className='section-pad' style={{maxWidth:1060,margin:'0 auto',padding:'68px 24px'}}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <Lbl>Our Collection</Lbl>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,4vw,42px)',color:BURG,fontWeight:400,marginBottom:8}}>Featured Peptides</h2>
          <Div/>
          <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:460,margin:'0 auto'}}>Third-party verified purity. Cold chain protected. Premium quality every time.</p>
        </div>
        <div className='prod-grid' style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:18,marginBottom:32}}>
          {PRODS.slice(0,4).map(p=><ProdCard key={p.id} p={p} addCart={addCart}/>)}
        </div>
        <div style={{textAlign:'center'}}><Btn onClick={()=>go('products')}>View All {PRODS.length} Products</Btn></div>
      </div>
      {/* About */}
      <div style={{background:BLUSH,padding:'64px 24px',borderTop:`1px solid ${BORDER}`,borderBottom:`1px solid ${BORDER}`,textAlign:'center'}}>
        <div style={{maxWidth:740,margin:'0 auto'}}>
          <Lbl>About The Vial Vault</Lbl>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(24px,3.5vw,38px)',color:BURG,fontWeight:400,marginBottom:10}}>Quality Locked In. Confidence Delivered.</h2>
          <Div/>
          <p style={{fontSize:13.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:560,margin:'0 auto 24px',lineHeight:2}}>
            Every product is third-party tested, handled with strict cold-chain protocols, and shipped with care from Murrells Inlet, South Carolina. Your research deserves the best.
          </p>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:24}}>
            {[['🔬','Purity Verified'],['🔒','Secure Handling'],['📦','Discreet Shipping'],['💛','Personal Service']].map(([ic,lb])=>(
              <div key={lb} style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:16}}>{ic}</span><span style={{fontSize:10.5,letterSpacing:1.5,color:BURG,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:700}}>{lb}</span></div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{background:BURG,padding:'52px 24px',textAlign:'center'}}>
        <div style={{maxWidth:560,margin:'0 auto'}}>
          <Lbl style={{color:RG_LT}}>Your Best Self Is Worth It ♥</Lbl>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(24px,4vw,40px)',color:WHITE,fontWeight:400,marginBottom:10}}>Ready to Start Your Research?</h2>
          <div style={{width:36,height:1,background:RG,margin:'0 auto 18px'}}/>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.7)',fontFamily:'Raleway,sans-serif',fontWeight:300,marginBottom:26,lineHeight:1.85}}>
            Use <strong style={{color:RG_LT,fontSize:15}}>VAULT10</strong> for 10% off your first order.
          </p>
          <Btn onClick={()=>go('products')} style={{background:`linear-gradient(135deg,${RG},${RG_LT})`}}>Shop the Vault</Btn>
        </div>
      </div>
    </div>
  );
}

// ── PRODUCTS PAGE ─────────────────────────────────────────────────────────────
function Products({addCart}){
  const [cat,setCat]=useState('All');
  const [q,setQ]=useState('');
  const list=PRODS.filter(p=>(cat==='All'||p.cat===cat)&&(p.name.toLowerCase().includes(q.toLowerCase())||p.cat.toLowerCase().includes(q.toLowerCase())));
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>Research Collection</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,50px)',color:BURG,fontWeight:400,marginBottom:8}}>Our Peptides</h1>
        <Div/>
        <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:460,margin:'0 auto'}}>Premium research compounds — third-party tested, cold chain protected.</p>
      </div>
      <div style={{maxWidth:1060,margin:'0 auto',padding:'28px 24px'}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24,alignItems:'center'}}>
          <input placeholder="Search peptides..." value={q} onChange={e=>setQ(e.target.value)}
            style={{flex:1,minWidth:180,padding:'10px 13px',border:`1px solid ${BORDER}`,background:WHITE,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none'}}/>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {CATS.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{padding:'8px 14px',background:cat===c?BURG:'transparent',color:cat===c?WHITE:BURG,border:`1px solid ${cat===c?BURG:BORDER}`,fontFamily:'Raleway,sans-serif',fontSize:9.5,letterSpacing:1.5,textTransform:'uppercase',cursor:'pointer',transition:'all 0.2s'}}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className='prod-grid' style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:18}}>
          {list.map(p=><ProdCard key={p.id} p={p} addCart={addCart}/>)}
        </div>
        {list.length===0&&<div style={{textAlign:'center',padding:'60px 0'}}><p style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:BURG}}>No products found</p></div>}
        <div style={{marginTop:32,padding:16,background:BLUSH,borderLeft:`3px solid ${RG}`}}>
          <p style={{fontSize:11.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8}}>
            <strong style={{color:BURG}}>Research Use Only:</strong> All products are strictly for research & educational purposes. Not for human consumption. Not evaluated by the FDA. Must be 18+ to purchase.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── CALCULATOR ────────────────────────────────────────────────────────────────
function Calc(){
  const [vial,setVial]=useState('');
  const [bac,setBac]=useState('');
  const [dose,setDose]=useState('');
  const [res,setRes]=useState(null);
  const calc=()=>{
    const mg=parseFloat(vial),ml=parseFloat(bac),d=parseFloat(dose);
    if(!mg||!ml)return;
    const mcgPerMl=(mg*1000)/ml;
    const mcgPerUnit=mcgPerMl/100;
    setRes({mcgPerMl:mcgPerMl.toFixed(2),mcgPerUnit:mcgPerUnit.toFixed(2),units:d?(d/mcgPerUnit).toFixed(1):null,mlNeed:d?(d/mcgPerMl).toFixed(3):null,dose:d});
  };
  const Inp=({l,v,set,ph,u})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:'block',fontSize:9.5,letterSpacing:2,color:TEXT_M,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600,marginBottom:5}}>{l}</label>
      <div style={{display:'flex'}}>
        <input type="number" value={v} onChange={e=>set(e.target.value)} placeholder={ph}
          style={{flex:1,padding:'12px 13px',border:`1px solid ${BORDER}`,borderRight:'none',background:WHITE,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none'}}/>
        <div style={{padding:'12px 13px',background:BLUSH,border:`1px solid ${BORDER}`,borderLeft:'none',fontSize:12,color:MAUVE,fontFamily:'Raleway,sans-serif',whiteSpace:'nowrap'}}>{u}</div>
      </div>
    </div>
  );
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>Research Tool</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,50px)',color:BURG,fontWeight:400,marginBottom:8}}>Peptide Calculator</h1>
        <Div/>
        <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:440,margin:'0 auto'}}>Calculate reconstitution ratios and dosing volumes for your research protocol.</p>
      </div>
      <div style={{maxWidth:640,margin:'0 auto',padding:'44px 24px'}}>
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderTop:`3px solid ${RG}`,padding:'32px 28px',boxShadow:'0 6px 28px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,color:BURG,fontWeight:400,marginBottom:22}}>Reconstitution Calculator</h2>
          <Inp l="Vial Amount" v={vial} set={setVial} ph="e.g. 10" u="mg"/>
          <Inp l="BAC Water to Add" v={bac} set={setBac} ph="e.g. 2" u="mL"/>
          <Inp l="Desired Dose (optional)" v={dose} set={setDose} ph="e.g. 250" u="mcg"/>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <Btn onClick={calc} style={{flex:1}}>Calculate</Btn>
            <button onClick={()=>{setVial('');setBac('');setDose('');setRes(null);}} style={{padding:'12px 20px',background:'transparent',color:BURG,border:`1px solid ${BORDER}`,fontFamily:'Raleway,sans-serif',fontSize:10.5,letterSpacing:2,textTransform:'uppercase',cursor:'pointer'}}>Reset</button>
          </div>
          {res&&(
            <div style={{marginTop:24,padding:18,background:BLUSH,borderLeft:`4px solid ${RG}`,animation:'fadeInUp 0.3s ease'}}>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:BURG,marginBottom:14}}>Results</div>
              {[['Concentration',`${res.mcgPerMl} mcg/mL`,'per mL'],['Per Unit (IU)',`${res.mcgPerUnit} mcg`,'on insulin syringe'],...(res.units?[['Units for Dose',`${res.units} IU`,`for ${res.dose}mcg`],['mL for Dose',`${res.mlNeed} mL`,`for ${res.dose}mcg`]]:[])].map(([l,v,s])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',padding:'9px 0',borderBottom:`1px solid rgba(196,133,106,0.2)`}}>
                  <div>
                    <div style={{fontSize:9.5,letterSpacing:1.5,color:MAUVE,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600}}>{l}</div>
                    <div style={{fontSize:10,color:TEXT_M,fontFamily:'Raleway,sans-serif',marginTop:1}}>{s}</div>
                  </div>
                  <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:BURG,fontWeight:500}}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{marginTop:20,padding:18,background:WHITE,border:`1px solid ${BORDER}`}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:BURG,marginBottom:10}}>How to Use This Calculator</div>
          {['1. Enter vial amount in milligrams (mg) from your product label.','2. Enter BAC water amount in mL you plan to add.','3. Optionally enter desired dose in mcg to see units to draw.','4. Use a U-100 insulin syringe (100 units = 1 mL) to measure.'].map(s=>(
            <p key={s} style={{fontSize:12,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8,marginBottom:4}}>{s}</p>
          ))}
          <p style={{fontSize:10.5,color:MAUVE,marginTop:10,fontFamily:'Raleway,sans-serif',fontStyle:'italic'}}>⚠️ For research purposes only. Consult a qualified professional before any protocol.</p>
        </div>
      </div>
    </div>
  );
}

// ── HOW TO USE ────────────────────────────────────────────────────────────────
function HowTo(){
  const Box=({icon,title,items})=>(
    <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderTop:`3px solid ${RG}`,padding:'24px 22px',marginBottom:18}}>
      <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:14}}>
        <div style={{width:38,height:38,borderRadius:'50%',background:BLUSH,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{icon}</div>
        <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:BURG,fontWeight:400}}>{title}</h3>
      </div>
      {items.map((item,i)=>(
        <div key={i} style={{display:'flex',gap:10,marginBottom:9,alignItems:'flex-start'}}>
          {typeof item==='string'?(
            <><span style={{color:RG,fontSize:7,marginTop:5,flexShrink:0}}>◆</span>
            <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8}}>{item}</p></>
          ):(
            <><div style={{minWidth:24,height:24,borderRadius:'50%',background:`linear-gradient(135deg,${RG},${RG_DK})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:WHITE,fontFamily:'Raleway,sans-serif',fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}</div>
            <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8}}>{item.t}</p></>
          )}
        </div>
      ))}
    </div>
  );
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>Research Protocols</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,50px)',color:BURG,fontWeight:400,marginBottom:8}}>How To Use & Store</h1>
        <Div/>
        <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:460,margin:'0 auto'}}>Step-by-step guidance for reconstitution, handling, and proper storage.</p>
      </div>
      <div style={{maxWidth:780,margin:'0 auto',padding:'44px 24px'}}>
        <Box icon="🧰" title="What You'll Need" items={['Lyophilized peptide vial from The Vial Vault','Bacteriostatic (BAC) water for reconstitution','U-100 insulin syringes (0.3mL or 0.5mL)','Alcohol swabs (70% isopropyl)','Sterile gloves (recommended)','Refrigerator for post-reconstitution storage']}/>
        <Box icon="💧" title="Reconstitution Steps" items={[{t:'Allow vial and BAC water to reach room temperature.'},{t:'Wipe rubber stoppers with alcohol swab and let dry.'},{t:'Draw desired BAC water amount into a fresh syringe.'},{t:'Inject BAC water slowly down the side of the vial — do NOT squirt directly onto powder.'},{t:'Gently swirl (never shake) until fully dissolved. Solution should be clear.'},{t:'Label vial with date reconstituted. Refrigerate immediately.'}]}/>
        <Box icon="❄️" title="Storage Guidelines" items={['Lyophilized (unopened): room temperature, up to 12 months. Avoid heat and direct light.','After reconstitution: refrigerate at 2–8°C (35–46°F). Use within 28–30 days.','NEVER freeze reconstituted peptide solutions — this degrades the compound.','Keep all vials sealed and away from light and air.']}/>
        <Box icon="💉" title="Dosing Tips" items={['Use our Peptide Calculator to determine exact concentration per unit.','Always draw your dose with a fresh sterile syringe.','Wipe the stopper with an alcohol swab before every draw.','Standard U-100 syringes: 100 units = 1 mL for accurate measurement.']}/>
        <div style={{padding:16,background:BLUSH,borderLeft:`4px solid ${RG}`}}>
          <p style={{fontSize:12,color:TEXT_M,fontFamily:'Raleway,sans-serif',lineHeight:1.8,fontWeight:300}}>
            <strong style={{color:BURG}}>Disclaimer:</strong> All guidance is for <strong>research & educational purposes only</strong>. The Vial Vault is not a licensed medical provider. Not for human consumption. Consult a qualified professional before any protocol.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SAFETY ────────────────────────────────────────────────────────────────────
function Safety(){
  const Sec=({title,items,warn})=>(
    <div style={{marginBottom:20,background:WHITE,border:`1px solid ${BORDER}`,borderLeft:`4px solid ${warn?'#c0392b':RG}`,padding:'20px 20px'}}>
      <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,color:BURG,fontWeight:400,marginBottom:11}}>{title}</h3>
      {items.map((t,i)=>(
        <div key={i} style={{display:'flex',gap:7,marginBottom:7,alignItems:'flex-start'}}>
          <span style={{color:warn?'#c0392b':RG,fontSize:8,marginTop:4,flexShrink:0}}>{warn?'⚠':'◆'}</span>
          <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8}}>{t}</p>
        </div>
      ))}
    </div>
  );
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>Research Safety</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,50px)',color:BURG,fontWeight:400,marginBottom:8}}>Safety Protocols</h1>
        <Div/>
        <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,maxWidth:460,margin:'0 auto'}}>Essential safety information for responsible peptide research handling.</p>
      </div>
      <div style={{maxWidth:780,margin:'0 auto',padding:'44px 24px'}}>
        <div style={{padding:18,background:'rgba(192,57,43,0.06)',border:'1px solid rgba(192,57,43,0.25)',borderLeft:'4px solid #c0392b',marginBottom:22}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,color:'#c0392b',marginBottom:6}}>Important Research Disclaimer</div>
          <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.8}}>All products are sold <strong>strictly for research & educational purposes only</strong>. NOT approved by the FDA for human use. Never use for self-treatment. Always consult a licensed healthcare professional.</p>
        </div>
        <Sec title="General Research Safety" items={['Always work in a clean, sterile environment when handling compounds.','Never use a product if the vial seal is broken or tampered with upon arrival.','Never use if the reconstituted solution appears cloudy or contains particles.','Keep all research compounds out of reach of children.','Label all reconstituted vials with date and contents.']}/>
        <Sec title="Sterility Protocols" items={['Wipe all rubber stoppers with 70% isopropyl alcohol before each use.','Use only sterile, single-use syringes — never reuse or share.','Draw from the vial with a fresh syringe each time.','Dispose of used syringes in a proper sharps container.']}/>
        <Sec title="Storage Safety" items={['Refrigerate reconstituted peptides immediately at 2–8°C.','Do NOT freeze reconstituted solutions.','Never use a peptide past its reconstitution date (28–30 days).','Discard any vial that has been improperly stored.']}/>
        <Sec warn title="Contraindications & Warnings" items={['Do not handle if pregnant, breastfeeding, or may become pregnant.','Do not combine compounds without thorough research and professional guidance.','Known allergy to any peptide compound — do not use.','Individuals with hormone-sensitive conditions should consult a professional first.']}/>
        <Sec warn title="Emergency Protocol" items={['If any adverse reaction occurs, stop the research protocol immediately.','Seek medical attention promptly if experiencing unexpected symptoms.','In case of emergency, call 911 immediately.','Keep records of all compounds used, doses, and timing for medical reference.']}/>
        <div style={{padding:16,background:BLUSH,borderLeft:`4px solid ${RG}`,marginTop:4}}>
          <p style={{fontSize:11.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',lineHeight:1.8,fontWeight:300}}>
            <strong style={{color:BURG}}>By purchasing from The Vial Vault</strong>, you acknowledge you are a qualified researcher and assume all responsibility for proper handling, storage, and use in accordance with applicable laws.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
function Contact(){
  const [form,setForm]=useState({name:'',email:'',phone:'',msg:''});
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const sub=async()=>{
    if(!form.name||!form.email||!form.msg)return;
    setBusy(true);
    const fd=new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    fd.append('_subject',`Contact from ${form.name} — The Vial Vault`);
    try{await fetch(`https://formspree.io/f/${BIZ.formId}`,{method:'POST',body:fd})}catch{}
    setBusy(false);setSent(true);
  };
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>Get In Touch</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(28px,5vw,50px)',color:BURG,fontWeight:400,marginBottom:8}}>Contact Us</h1>
        <Div/>
      </div>
      <div style={{maxWidth:860,margin:'0 auto',padding:'44px 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:28}} className="contact-grid">
        <div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:26,color:BURG,fontWeight:400,marginBottom:16}}>We'd Love to Hear From You</h2>
          <p style={{fontSize:13,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.85,marginBottom:24}}>Have questions about products, protocols, or your order? We're a small personal team and respond promptly.</p>
          {[['📧','Email',BIZ.email],['📞','Phone / Text',BIZ.phone],['📍','Location',BIZ.location],['💸','Zelle',BIZ.zelle],['📱','Venmo',BIZ.venmo]].map(([ic,l,v])=>(
            <div key={l} style={{display:'flex',gap:10,marginBottom:14,alignItems:'flex-start'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:BLUSH,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{ic}</div>
              <div>
                <div style={{fontSize:9,letterSpacing:2,color:MAUVE,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',fontWeight:600,marginBottom:2}}>{l}</div>
                <div style={{fontSize:13,color:BURG,fontFamily:'Raleway,sans-serif'}}>{v}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:WHITE,border:`1px solid ${BORDER}`,borderTop:`3px solid ${RG}`,padding:'24px 22px'}}>
          {!sent?(
            <>
              {[['Full Name *','name','text'],['Email *','email','email'],['Phone','phone','tel']].map(([l,k,t])=>(
                <div key={k} style={{marginBottom:11}}>
                  <label style={{display:'block',fontSize:9.5,letterSpacing:2,color:TEXT_M,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:4}}>{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    style={{width:'100%',padding:'10px 12px',border:`1px solid ${BORDER}`,background:BG,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:9.5,letterSpacing:2,color:TEXT_M,textTransform:'uppercase',fontFamily:'Raleway,sans-serif',marginBottom:4}}>Message *</label>
                <textarea value={form.msg} onChange={e=>setForm(f=>({...f,msg:e.target.value}))} rows={5}
                  style={{width:'100%',padding:'10px 12px',border:`1px solid ${BORDER}`,background:BG,color:TEXT,fontFamily:'Raleway,sans-serif',fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
              </div>
              <Btn onClick={sub} disabled={busy||!form.name||!form.email||!form.msg} style={{width:'100%'}}>
                {busy?'Sending...':'Send Message'}
              </Btn>
            </>
          ):(
            <div style={{textAlign:'center',paddingTop:40}}>
              <div style={{fontSize:36,marginBottom:10}}>✦</div>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,color:BURG,fontWeight:400,marginBottom:8}}>Message Received!</h3>
              <p style={{fontSize:12.5,color:TEXT_M,fontFamily:'Raleway,sans-serif',fontWeight:300,lineHeight:1.75}}>We'll get back to you shortly. Thank you for reaching out.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LEGAL PAGES ───────────────────────────────────────────────────────────────
function Legal({title,children}){
  return(
    <div style={{paddingTop:62,minHeight:'100vh',background:BG}}>
      <div className='page-hero' style={{background:`linear-gradient(155deg,${BLUSH} 0%,${BG} 100%)`,padding:'44px 24px',textAlign:'center',borderBottom:`1px solid ${BORDER}`}}>
        <Lbl>The Vial Vault · Legal</Lbl>
        <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(26px,4vw,44px)',color:BURG,fontWeight:400,marginBottom:8}}>{title}</h1>
        <Div/>
      </div>
      <div style={{maxWidth:780,margin:'0 auto',padding:'44px 40px',fontSize:13,lineHeight:1.9,color:TEXT_M,fontWeight:300,fontFamily:'Raleway,sans-serif'}}>
        {children}
      </div>
    </div>
  );
}
const LS=({t,c})=><div style={{marginBottom:26}}><h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:19,fontWeight:400,color:BURG,marginBottom:8}}>{t}</h2><p>{c}</p></div>;

const Privacy=()=><Legal title="Privacy Policy">
  <LS t="1. Information We Collect" c="We collect information you provide directly — name, email, phone, and shipping address — when you place an order or contact us. We also collect usage data through essential cookies."/>
  <LS t="2. How We Use Your Information" c="Your information is used solely to process and fulfill research product orders, communicate order status, and send promotional emails if subscribed. We do not sell or share your personal information with third parties for marketing purposes."/>
  <LS t="3. Data Security" c="All form submissions are processed through Formspree with SSL encryption. We take reasonable measures to protect your information, though no internet transmission is 100% secure."/>
  <LS t="4. Cookies" c="We use essential cookies to remember your age verification and site preferences. You may disable cookies in your browser settings, though some features may not function properly."/>
  <LS t="5. Age Verification" c="We do not knowingly collect information from individuals under 18 years of age. If we discover any such information, we will delete it immediately."/>
  <LS t="6. Contact" c={`For privacy questions: ${BIZ.email} or ${BIZ.phone}.`}/>
</Legal>;

const Terms=()=><Legal title="Terms of Service">
  <div style={{padding:'14px 18px',background:'rgba(196,133,106,0.08)',borderLeft:`4px solid ${RG}`,marginBottom:24,fontSize:13.5,color:BURG,fontWeight:400,lineHeight:1.8}}>
    BY ACCESSING THIS WEBSITE OR PURCHASING ANY PRODUCT, YOU AGREE TO THESE TERMS IN FULL.
  </div>
  <LS t="1. Research & Educational Use Only" c="ALL products sold by The Vial Vault are STRICTLY for in vitro research and educational purposes only. NOT intended for human consumption, injection, or any therapeutic use."/>
  <LS t="2. Age Requirement — 18+ Only" c="You must be at least 18 years of age to access this website or purchase products. The Vial Vault reserves the right to cancel any order if age cannot be verified."/>
  <LS t="3. No Medical Advice" c="Nothing on this website constitutes medical advice, diagnosis, or treatment recommendation. No physician-patient relationship is created. Always consult a licensed healthcare professional."/>
  <LS t="4. FDA Disclaimer" c="These products have not been evaluated by the FDA. Not approved to diagnose, treat, cure, or prevent any disease or health condition."/>
  <LS t="5. Assumption of Risk & Release" c="By purchasing, you knowingly assume all risks associated with possession, handling, storage, and use of research compounds. You release The Vial Vault from any and all claims or liabilities."/>
  <LS t="6. Governing Law" c="These Terms are governed by the laws of South Carolina. Disputes shall be resolved in the courts of Horry County, SC."/>
</Legal>;

const Disclaimer=()=><Legal title="Research Use Disclaimer">
  <div style={{padding:'16px 18px',background:'rgba(192,57,43,0.06)',border:'1px solid rgba(192,57,43,0.22)',borderLeft:'4px solid #c0392b',marginBottom:24,fontSize:13.5,color:'#c0392b',fontWeight:500,lineHeight:1.8}}>
    IMPORTANT: All peptide compounds offered by The Vial Vault are intended STRICTLY for research & educational purposes only. NOT approved by the FDA for human use.
  </div>
  <LS t="FDA Statement" c="These statements have not been evaluated by the FDA. Products are not intended to diagnose, treat, cure, or prevent any disease. Results not guaranteed."/>
  <LS t="No Medical Claims" c="The Vial Vault makes no medical claims. All descriptions use educational language only for academic reference."/>
  <LS t="Researcher Responsibility" c="The purchaser is solely responsible for ensuring they have appropriate knowledge, legal authorization, and qualifications to handle research compounds in their jurisdiction."/>
  <LS t="Age Restriction" c="All products restricted to adults 18+. Research compounds require proper training and understanding to handle safely."/>
  <LS t="Professional Consultation Required" c="We strongly recommend consulting a licensed, board-certified healthcare professional before beginning any research protocol."/>
</Legal>;

const Refund=()=><Legal title="Refund & Shipping Policy">
  <LS t="Shipping Policy" c="Orders are processed within 1–3 business days after payment is confirmed. We ship discreetly — no branding on exterior packaging. The Vial Vault is not responsible for carrier delays."/>
  <LS t="Cold Chain Handling" c="All peptide products are shipped with appropriate insulation and cold packs where required to maintain cold chain integrity during transit."/>
  <LS t="Refund Policy" c="Due to the nature of research compounds, ALL SALES ARE FINAL. We do not accept returns on any peptide product. If you receive a damaged or incorrect product, contact us within 48 hours at TheVialVault843@gmail.com."/>
  <LS t="Damaged or Incorrect Orders" c="If your order arrives damaged or incorrect, document with photos and contact us immediately. Resolution is at the sole discretion of The Vial Vault."/>
  <LS t="Order Cancellations" c="Orders may be cancelled before payment is confirmed. Once payment is received and processing begins, cancellations cannot be accepted. Contact us ASAP at 843-420-0420."/>
</Legal>;

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState('home');
  const [ageOk,setAgeOk]=useState(false);
  const [cookieOk,setCookieOk]=useState(false);
  const [popup,setPopup]=useState(false);
  const [cart,setCart]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);

  useEffect(()=>{
    if(ls.get('vv_age'))setAgeOk(true);
    if(ls.get('vv_cookie'))setCookieOk(true);
    if(ls.get('vv_sub'))return;
    const t=setTimeout(()=>setPopup(true),5000);
    return()=>clearTimeout(t);
  },[]);

  const confirmAge=()=>{ls.set('vv_age','1');setAgeOk(true);};
  const acceptCookie=()=>{ls.set('vv_cookie','1');setCookieOk(true);};
  const closePopup=()=>{ls.set('vv_sub','shown');setPopup(false);};

  const addCart=item=>{
    setCart(c=>{
      const ex=c.find(i=>i.id===item.id&&i.mg===item.mg);
      return ex?c.map(i=>i.id===item.id&&i.mg===item.mg?{...i,qty:i.qty+1}:i):[...c,item];
    });
  };

  const go=p=>{setPage(p);window.scrollTo(0,0);};
  const cartQty=cart.reduce((s,i)=>s+i.qty,0);

  const pages={
    home:<Home go={go} addCart={addCart}/>,
    products:<Products addCart={addCart}/>,
    calc:<Calc/>,
    howto:<HowTo/>,
    safety:<Safety/>,
    contact:<Contact/>,
    privacy:<Privacy/>,
    terms:<Terms/>,
    disclaimer:<Disclaimer/>,
    refund:<Refund/>,
  };

  return(
    <div style={{minHeight:'100vh',background:BG}}>
      {/* Shimmer page borders */}
      <div className="page-shimmer-top"/>
      <div className="page-shimmer-bottom"/>

      {!ageOk&&<AgeGate onOk={confirmAge}/>}
      {ageOk&&popup&&<Popup onClose={closePopup}/>}
      {ageOk&&!cookieOk&&<CookieBanner onAccept={acceptCookie} setPage={go}/>}
      {ageOk&&<Cart cart={cart} setCart={setCart} open={cartOpen} onClose={()=>setCartOpen(false)} go={go}/>}

      {ageOk&&<>
        <Nav page={page} go={go} cartQty={cartQty} openCart={()=>setCartOpen(true)}/>
        <main>{pages[page]||pages.home}</main>
        <Footer go={go}/>
      </>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

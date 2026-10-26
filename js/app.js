/* ===== 1. DATASET (Tabel 2.1 artikel; kode gejala dinormalisasi per nama, lihat halaman Dataset) ===== */
const SYM={G001:"Dada terasa penuh",G002:"Detak jantung cepat (tachycardia)",G003:"Detak jantung lambat (bradycardia)",G004:"Nyeri pada dada sebelah kiri",G006:"Sesak napas",G007:"Demam tinggi dan menggigil",G008:"Katup jantung tidak bekerja dengan baik",G009:"Bunyi jantung abnormal",G010:"Penyempitan pada dada",G012:"Mual dan muntah",G013:"Pusing",G014:"Pingsan (syncope)",G016:"Berat badan menurun",G017:"Sulit tidur",G018:"Denyut nadi yang lemah dan cepat",G019:"Mudah lelah"};
const CASES=[
{id:"P001",name:"Gagal Jantung",w:{G007:5,G001:5,G009:3,G013:1,G017:5,G019:1,G012:1,G008:5,G018:5,G004:5}},
{id:"P002",name:"Heart Valve Disease",w:{G018:5,G002:5,G008:5,G006:5,G013:1,G014:3,G016:3,G009:5,G003:3}},
{id:"P003",name:"Aritmia",w:{G001:5,G018:5,G006:5,G013:1}},
{id:"P004",name:"Perikarditis",w:{G019:5,G007:5,G010:5,G001:5,G006:5,G009:5,G004:5,G013:1,G012:3,G017:5}},
{id:"P005",name:"Jantung Koroner",w:{G008:5,G016:3,G006:5,G004:5,G001:5}}];
const SOLUSI={P003:"Makan secara teratur sangat dianjurkan untuk mengurangi resiko timbulnya tukak lambung serta istirahat yang cukup."};

/* ===== 2. MESIN CBR: Similarity = Σ(S×W)/ΣW, S=1 jika gejala kasus lama ada pada kasus baru, selain itu 0 ===== */
const crit=p=>p>=70?"High":p>=50?"Medium":"Low";
function cbr(sel){
  const r=CASES.map(c=>{
    const rows=Object.entries(c.w).map(([g,w])=>{const s=sel.has(g)?1:0;return{g,w,s,sw:s*w}});
    const num=rows.reduce((a,x)=>a+x.sw,0),den=rows.reduce((a,x)=>a+x.w,0),pct=num/den*100;
    return{...c,rows,num,den,pct,crit:crit(pct)};
  });
  return r.sort((a,b)=>b.pct-a.pct);
}

/* ===== 3. STATE & UTIL ===== */
const st={id:null,sel:new Set(),draft:null};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f=n=>n.toFixed(2).replace(".",",")+"%";
const CONTOH=["G001","G006","G013","G018","G003","G009"];
const ic=p=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I={
heart:ic('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
user:ic('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6"/>'),
list:ic('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
chart:ic('<path d="M5 20V10M12 20V4M19 20v-7"/>'),
alert:ic('<path d="M12 4 3 20h18L12 4z"/><path d="M12 10v4M12 17h.01"/>'),
check:ic('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
info:ic('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>')};
$("#logo").innerHTML=I.heart;
const stp=n=>`<ol class="stp" aria-label="Langkah diagnosis">${["Identitas","Gejala","Hasil"].map((t,i)=>`<li class="${i+1<n?"done":i+1===n?"cur":""}"${i+1===n?' aria-current="step"':""}>${i+1}. ${t}</li>`).join("")}</ol>`;
const WL={5:"Dominan",3:"Sedang",1:"Biasa"};
const WAVE='<svg class="wave" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M800 0V400H470C560 330 430 270 520 200S700 150 640 80 760 20 700 0Z" fill="#1A3D63" opacity=".7"/><path d="M800 0V400H590C660 340 560 290 640 230S780 190 730 120 800 60 780 0Z" fill="#4A7FA7" opacity=".4"/><path d="M800 0V330C760 290 790 240 740 190S800 110 760 50Z" fill="#B3CFE5" opacity=".35"/></svg>';

/* ===== 4. HALAMAN ===== */
const V={
"":()=>`<section class="card hero">${WAVE}<h1>Sistem Pakar Diagnosa Penyakit Jantung</h1>
<p class="lead">Pilih gejala yang Anda rasakan, lalu dapatkan perkiraan awal penyakit jantung yang paling mirip. Prosesnya singkat dan tidak memerlukan data medis.</p>
<div class="row"><a class="btn" href="#identitas">Mulai Diagnosis</a><a class="btn sec" href="#dataset">Lihat Dataset</a></div>
<svg class="ecg" viewBox="0 0 600 96" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 52H150l12-8 12 8h46l10 8 12-46 14 80 10-42h64l12-10 14 10H600"/></svg></section>
<div class="steps">
<div class="card step"><span class="ib">${I.user}</span><div><h3>1. Isi identitas</h3><p class="mu sm">Nama, usia, dan jenis kelamin pasien.</p></div></div>
<div class="card step"><span class="ib">${I.list}</span><div><h3>2. Pilih gejala</h3><p class="mu sm">Centang semua gejala yang sedang dialami.</p></div></div>
<div class="card step"><span class="ib">${I.chart}</span><div><h3>3. Lihat hasil</h3><p class="mu sm">Terima penyakit yang paling mirip beserta sarannya.</p></div></div></div>
<div class="note">${I.alert}<p>Hasil merupakan perkiraan awal berdasarkan pencocokan kasus, bukan pengganti pemeriksaan dokter.</p></div>`,

identitas:()=>{const i=st.id||st.draft||{};return `${stp(1)}<div class="ph"><h1>Identitas Pasien</h1><p class="mu">Data ini hanya melengkapi laporan hasil diagnosis.</p></div>
<form id="fid" class="card fm" novalidate>
<div class="field"><label for="f-nama">Nama pasien</label><input id="f-nama" name="nama" maxlength="60" autocomplete="name" aria-describedby="e-nama" value="${esc(i.nama||"")}"><span class="fe" id="e-nama" role="alert"></span></div>
<div class="field"><label for="f-usia">Usia (tahun)</label><input id="f-usia" name="usia" type="number" inputmode="numeric" min="0" max="120" aria-describedby="e-usia" value="${esc(i.usia||"")}"><span class="fe" id="e-usia" role="alert"></span></div>
<div class="field"><label for="f-jk">Jenis kelamin</label><select id="f-jk" name="jk" aria-describedby="e-jk"><option value="">Pilih jenis kelamin</option><option${i.jk==="Laki-laki"?" selected":""}>Laki-laki</option><option${i.jk==="Perempuan"?" selected":""}>Perempuan</option></select><span class="fe" id="e-jk" role="alert"></span></div>
<button class="btn" style="width:100%">Lanjutkan</button></form>`},

gejala:()=>`${stp(2)}<div class="top"><div class="ph" style="margin-bottom:0"><h1>Pilih Gejala</h1><p class="mu">Pasien: <b>${esc(st.id.nama)}</b>. Centang semua gejala yang sedang dialami.</p></div><span class="pill cnt" aria-live="polite"></span></div>
<div class="grid">${Object.entries(SYM).map(([g,n])=>`<label class="sym"><input type="checkbox" value="${g}"${st.sel.has(g)?" checked":""}><span class="box">${I.check}</span><span>${n}</span></label>`).join("")}</div>
<div class="act"><p id="err" class="err" role="alert"></p>
<div class="row"><button id="go" class="btn">Proses Diagnosis</button><button id="ex" class="btn sec">Isi Contoh</button><button id="clr" class="btn sec">Kosongkan Pilihan</button></div></div>`,

hasil:()=>{
  const r=cbr(st.sel),t=r[0],top=r.filter(x=>x.num*t.den===t.num*x.den),i=st.id;
  const gl=[...st.sel].sort().map(g=>`<span class="chip">${SYM[g]}</span>`).join("");
  return `${stp(3)}<div class="ph" style="margin-bottom:20px"><h1>Hasil Diagnosis</h1></div><div class="stack">
<section class="card verdict">
${t.pct===0?`<p class="lb">Hasil pencocokan</p><h2>Tidak ada kecocokan</h2><p class="mu" style="margin-top:10px">Gejala yang dipilih tidak cocok dengan kasus penyakit manapun dalam dataset (0%).</p>`:
`<p class="lb">${top.length>1?`Penyakit dengan kemiripan tertinggi (nilai sama)`:`Penyakit dengan kemiripan tertinggi`}</p>
<ul class="tops">${top.map(x=>`<li><h2>${x.name}</h2></li>`).join("")}</ul>
<div class="big">${f(t.pct)}</div><p>Kategori kemiripan: <span class="badge ${t.crit}">${t.crit}</span></p>
<p class="mu sm" style="margin-top:16px;max-width:60ch">Hasil diperoleh dengan mencocokkan gejala yang dipilih dengan dataset kasus yang tersedia.${top.length>1?` ${top.length} penyakit memiliki nilai yang sama, sehingga semuanya ditampilkan.`:""}</p>`}
</section>
<section class="card"><h3>Perbandingan semua penyakit</h3>
${r.map(c=>`<div class="bar${c.num*t.den===t.num*c.den&&t.pct>0?" top":""}"><span class="nm">${c.name}</span><b>${f(c.pct)} <span class="badge ${c.crit}">${c.crit}</span></b><div class="track" role="progressbar" aria-label="${c.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.pct.toFixed(2)}"><i style="width:${c.pct}%"></i></div></div>`).join("")}
<p class="mu sm">Kategori: 70–100 High, 50–69 Medium, 0–49 Low.</p></section>
<section class="card"><h3 style="margin-bottom:14px">Informasi dan saran</h3>
${t.pct===0?`<div class="sg">${I.info}<p>Karena tidak ada kecocokan, sistem tidak dapat memberi saran khusus. Jika Anda merasa tidak sehat, konsultasikan dengan dokter atau tenaga medis.</p></div>`:
top.map(x=>`<div class="sg">${I.info}<p><b>${x.name}:</b> ${SOLUSI[x.id]||"Informasi pengobatan untuk penyakit ini belum tersedia di sistem. Konsultasikan kondisi Anda dengan dokter atau tenaga medis."}</p></div>`).join("")}</section>
<div class="note">${I.alert}<p><b>Ini bukan diagnosis medis.</b> Hasil hanya perkiraan awal dari pencocokan gejala. Periksakan diri ke dokter atau tenaga medis, dan segera ke fasilitas kesehatan bila gejala terasa berat atau mengkhawatirkan.</p></div>
<section class="card"><h3>Data yang digunakan</h3><p class="mu sm" style="margin-top:4px">${esc(i.nama)}, ${esc(i.usia)} tahun, ${esc(i.jk)}</p><div class="chips">${gl}</div></section>
<div class="row"><a class="btn sec" href="#gejala">Kembali ke Gejala</a><button id="new" class="btn">Diagnosis Baru</button></div></div>`},

dataset:()=>`<div class="ph"><h1>Dataset Kasus</h1><p class="mu">Referensi lima kasus penyakit dari Tabel 2.1 artikel “Kesesuaian Bobot Terhadap Gejala”. Bobot menunjukkan seberapa kuat suatu gejala menandai penyakit.</p></div><div class="stack">
${CASES.map(c=>`<section class="card"><div class="dh"><h3>${c.name}</h3><span><span class="tag">${c.id}</span> <span class="pill">Total bobot ${Object.values(c.w).reduce((a,b)=>a+b,0)}</span></span></div><div class="sc"><table><thead><tr><th>Kode</th><th>Gejala</th><th class="n">Bobot</th></tr></thead><tbody>${Object.entries(c.w).map(([g,w])=>`<tr><td class="k">${g}</td><td>${SYM[g]}</td><td class="n">${w}<span class="wt w${w}">${WL[w]}</span></td></tr>`).join("")}</tbody></table></div></section>`).join("")}
<details class="more"><summary>Sumber dan catatan penyesuaian data</summary>
<ul><li>Bobot parameter (Tabel 2.2): Dominan = 5, Sedang = 3, Biasa = 1. Kriteria kemiripan (Tabel 2.3): 70–100 High, 50–69 Medium, 0–49 Low.</li>
<li>P001 baris “G013 Katup jantung…” dibaca sebagai G008 (G013 sudah dipakai Pusing).</li>
<li>P003 memakai kode berbeda dari tabel lain; dinormalkan menurut nama: Denyut nadi → G018, Sesak napas → G006, Pusing → G013.</li>
<li>Ejaan “Deman” dan “Katub” disamakan menjadi “Demam” dan “Katup”.</li>
<li>Bobot gejala yang sama berbeda antar penyakit dipertahankan (Bunyi jantung abnormal 3 di P001 dan 5 lainnya; Mudah lelah 1 dan 5; Mual dan muntah 1 dan 3).</li>
<li>Tabel 3.1 (3 kasus) adalah subset Tabel 2.1 dengan bobot identik; sistem memakai seluruh 5 penyakit Tabel 2.1.</li>
<li>Contoh artikel (Tabel 3.2) punya 7 gejala; “Badan lesu atau lemah” tidak ada di dataset sehingga tidak tersedia.</li>
<li>Artikel hanya memberi solusi pengobatan untuk Aritmia.</li>
<li>Sumber: Dona, Maradona &amp; Masdewi, ZONAsi Vol. 3 No. 1, Maret 2021.</li></ul></details></div>`
};

/* ===== 5. ROUTER & EVENT ===== */
function bind(h){
  if(h==="identitas"){
    const fm=$("#fid");
    fm.addEventListener("input",()=>{const d=new FormData(fm);st.draft={nama:d.get("nama"),usia:d.get("usia"),jk:d.get("jk")}});
    fm.addEventListener("submit",e=>{
      e.preventDefault();const d=new FormData(fm),nama=d.get("nama").trim(),usia=d.get("usia"),jk=d.get("jk"),u=Number(usia);
      const er={nama:nama?"":"Masukkan nama pasien.",usia:(usia===""||!Number.isInteger(u)||u<0||u>120)?"Masukkan usia antara 0 dan 120 tahun.":"",jk:jk?"":"Pilih jenis kelamin."};
      let bad=null;
      for(const k in er){const el=fm.elements[k];$("#e-"+k).textContent=er[k];el.setAttribute("aria-invalid",er[k]?"true":"false");if(er[k]&&!bad)bad=el}
      if(bad){bad.focus();return}
      st.id={nama,usia,jk};location.hash="gejala";
    });
  }
  if(h==="gejala"){
    const cnt=()=>{document.querySelectorAll(".cnt").forEach(e=>e.textContent=st.sel.size+" dari "+Object.keys(SYM).length+" gejala dipilih")};cnt();
    document.querySelectorAll(".sym input").forEach(c=>c.addEventListener("change",()=>{c.checked?st.sel.add(c.value):st.sel.delete(c.value);$("#err").textContent="";cnt()}));
    $("#ex").onclick=()=>{st.sel=new Set(CONTOH);render("gejala")};
    $("#clr").onclick=()=>{st.sel.clear();render("gejala")};
    $("#go").onclick=()=>{if(!st.sel.size){$("#err").textContent="Pilih minimal satu gejala sebelum memproses diagnosis.";return}location.hash="hasil"};
  }
  if(h==="hasil")$("#new").onclick=()=>{st.id=null;st.draft=null;st.sel.clear();location.hash="identitas"};
}
function closeMenu(){$("#nav").classList.remove("open");$("#menu").setAttribute("aria-expanded","false")}
function render(h){
  $("#app").innerHTML=V[h]();
  document.querySelectorAll("#nav a").forEach(a=>{const on=a.dataset.r===h;on?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current")});
  closeMenu();bind(h);window.scrollTo(0,0);$("#app").focus({preventScroll:true});
}
function route(){
  let h=location.hash.slice(1);if(!(h in V))h="";
  const need=h==="gejala"&&!st.id?"identitas":h==="hasil"&&!st.id?"identitas":h==="hasil"&&!st.sel.size?"gejala":null;
  if(need){location.hash=need;return}
  render(h);
}
$("#menu").addEventListener("click",()=>{const o=$("#nav").classList.toggle("open");$("#menu").setAttribute("aria-expanded",o)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
window.addEventListener("hashchange",route);route();

import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';

const article = path.resolve('content/articles/2026-10-24-personal-assistant-memory-and-agent-coordination');
const out = path.resolve('research/personal-assistant-memory-2026-10-24/diagrams');
await mkdir(out, {recursive:true});
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function diagram(id, height, title, description, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="${height}" viewBox="0 0 420 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" font-family="var(--ard-font-ui)" fill="var(--ard-text-strong)">
<title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>
${content}
</svg>`;
}
const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="var(--ard-surface)" stroke="var(--ard-border-strong)"/>`;
const text=(x,y,label,size=20)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${Math.max(18,size)}">${escape(label)}</text>`;
// The reader namespaces IDs. Explicit arrowheads avoid fragment URL references.
const line=(id,d,arrow=true)=>{
  let head='';
  if(arrow) {
    const tokens=d.match(/[MLHV]|-?\d+(?:\.\d+)?/g);
    let x=0,y=0,px=0,py=0;
    for(let i=0;i<tokens.length;) {
      const op=tokens[i++];px=x;py=y;
      if(op==='M'||op==='L'){x=Number(tokens[i++]);y=Number(tokens[i++]);}
      else if(op==='H')x=Number(tokens[i++]);
      else if(op==='V')y=Number(tokens[i++]);
      else throw Error(`Unsupported arrow path ${d}`);
    }
    const length=Math.hypot(x-px,y-py),dx=(x-px)/length,dy=(y-py)/length;
    head=`<polygon points="${x},${y} ${x-9*dx+4*dy},${y-9*dy-4*dx} ${x-9*dx-4*dy},${y-9*dy+4*dx}" fill="var(--ard-signal)"/>`;
  }
  return `<path d="${d}" fill="none" stroke="var(--ard-signal)" stroke-width="2"/>${head}`;
};

for(const locale of ['ja','en']) {
  const ja=locale==='ja',id=`coordination-${locale}`;
  let body=box(55,10,310,86)+text(210,45,ja?'人間':'User',26)+text(210,76,ja?'仕事を頼む、相談に答える':'Request work, answer questions',18);
  body+=line(id,'M105 96V120')+text(105,148,ja?'依頼と回答':'Requests and answers',18)+line(id,'M105 163V188');
  body+=line(id,'M315 188V163')+text(315,148,ja?'相談と報告':'Questions and reports',18)+line(id,'M315 120V96');
  body+=box(55,190,310,114)+text(210,227,'dot',30)+text(210,258,ja?'タスクの会話を読む':'Read task conversations',18)+text(210,285,ja?'質問と残った作業を整理':'Find questions and unfinished work',18);
  body+=line(id,'M105 304V326')+text(105,354,ja?'続きを指示':'Ask to finish the work',18)+line(id,'M105 369V394');
  body+=line(id,'M315 394V369')+text(315,354,ja?'進み具合と質問':'Progress and questions',18)+line(id,'M315 326V304');
  body+=line(id,'M70 414V396H350V414',false)+line(id,'M210 396V414',false);
  for(const [i,name] of ['A','B','C'].entries()) {
    const x=8+i*140;
    body+=box(x,416,124,96)+text(x+62,451,`Codex ${name}`,22)+text(x+62,480,ja?'調査、実装':'Research',18)+text(x+62,500,ja?'検証':'Code, verify',18);
  }
  const overview=diagram(id,525,ja?'dotが会話を読み、質問と残った作業を整理する':'Dot reads conversations and finds questions and unfinished work',ja?'人間が仕事を頼む。dotはタスクの会話を読んで残った作業を進めるよう指示し、人間に答えてほしい相談と作業の結果を返す。':'The user requests work. Dot reads task conversations, asks tasks to finish requested work, and returns questions and results to the user.',body);

  const fid=`decision-${locale}`;
  let flow=box(8,10,196,100)+box(216,10,196,100);
  flow+=text(106,43,ja?'前に話したこと':'Earlier conversations',20)+text(106,73,ja?'何を頼んだか':'What was requested',18)+text(106,96,ja?'後から変えた指示':'Later changes',18);
  flow+=text(314,43,ja?'今の進み具合':'Current progress',21)+text(314,73,ja?'何が終わったか':'What is finished',18)+text(314,96,ja?'何が残っているか':'What remains',18);
  flow+=line(fid,'M106 110V130H210V153')+line(fid,'M314 110V130H210',false);
  flow+=box(38,157,344,103)+text(210,191,ja?'依頼と変更を読み直す':'Check requests and changes',21)+text(210,221,ja?'何を任せ、何を止めたか':'What was requested or paused',18)+text(210,247,ja?'読めない会話は人間に確認':'Ask about unreadable conversations',18);
  flow+=line(fid,'M210 260V287');
  flow+=box(38,290,344,74)+text(210,320,ja?'仕事ごとに返事を分ける':'Choose a reply for each task',21)+text(210,348,ja?'頼んだことか、新しい相談か':'Already requested, or a new question?',18);
  flow+=line(fid,'M210 364V383H20V656',false);
  const outputs=ja?[
    ['A：テストを進める','依頼に含まれ、まだ終わっていない'],
    ['B：サービスの相談を人間へ','まだ使ってよいと答えていない'],
    ['C：止めたままにする','再開してと言われるまで動かさない']
  ]:[
    ['A: Run the requested tests','Requested, still unfinished'],
    ['B: Ask about the service','Not yet approved by the user'],
    ['C: Keep the work paused','Wait until the user says resume']
  ];
  outputs.forEach(([label,detail],i)=>{
    const y=395+i*112;
    flow+=line(fid,`M20 ${y+38}H44`)+box(47,y,357,88)+text(225,y+34,label,ja?21:20)+text(225,y+65,detail,ja?18:16);
  });
  const decision=diagram(fid,720,ja?'Aはテストを進め、Bは相談し、Cは止めておく':'Run A’s tests, ask about B, and keep C paused',ja?'前の依頼と今の進み具合を読む。Aのテストは既に頼んだので進める。Bのサービス追加は人間に聞く。Cは再開の指示があるまで止めておく。':'Read earlier requests and current progress. Run A’s already requested tests, ask the user about B’s service, and keep C paused until the user requests resumption.',flow);
  for(const [name,svg]of [['overview',overview],['decision',decision]]) await writeFile(path.join(out,`${name}.${locale}.svg`),svg+'\n');
  let html=await readFile(path.join(article,`body.${locale}.html`),'utf8');
  for(const [name,svg]of [['coordination-overview',overview],['memory-decision-flow',decision]]) {
    const begin=`<!-- ${name} -->`,end=`<!-- /${name} -->`;
    const start=html.indexOf(begin),stop=html.indexOf(end,start);
    if(start<0)throw new Error(`Missing diagram marker ${name} in ${locale}`);
    html=html.slice(0,start)+`${begin}\n${svg}\n${end}`+html.slice(stop<0?start+begin.length:stop+end.length);
  }
  html=html.replace('添付の運用記録をもとに','筆者の運用記録をもとに');
  await writeFile(path.join(article,`body.${locale}.html`),html);
}

export const spatialCopy = {
  ja: {
    home:'トップ', topics:'トピック', body:'本文', related:'関連記事',
    back:'戻る', menu:'メニュー', close:'閉じる', toc:'目次', read:'本文を読む', open:'記事を見る',
    articles:n=>`${n} 記事`, sources:n=>`根拠 ${n}件`, evidence:'出典と編集責任',
    sameTopic:'同じテーマ', sameDate:'同じ調査日', tag:t=>`共通のタグ · ${t}`, nearDate:'近い調査対象日',
    research:'調査対象日', workspace:'時間と記事の作業面', months:'調査対象月',
    skip:'本文へ', loading:'読み込んでいます', error:'読み込めませんでした。', retry:'再試行',
    share:'共有', copy:'リンクをコピー', copied:'コピーしました', copyError:'コピーできませんでした',
    previous:'前のページ', next:'次のページ', month:id=>`${id.slice(0,4)}年${Number(id.slice(5))}月`,
    language:'ENGLISH', chapter:'この記事の章', theme:'テーマを開く', guide:'テーマガイド',
  },
  en: {
    home:'Home', topics:'Topics', body:'Article', related:'Related articles',
    back:'Back', menu:'Menu', close:'Close', toc:'Contents', read:'Read article', open:'Explore articles',
    articles:n=>`${n} ${n===1?'article':'articles'}`, sources:n=>`${n} sources`, evidence:'Sources and editorial review',
    sameTopic:'Same topic', sameDate:'Same research date', tag:t=>`Shared tag · ${t}`, nearDate:'Nearby research date',
    research:'Research date', workspace:'Time and article workspace', months:'Research months',
    skip:'Skip to content', loading:'Loading', error:'Could not load this article.', retry:'Retry',
    share:'Share', copy:'Copy link', copied:'Link copied', copyError:'Could not copy',
    previous:'Previous page', next:'Next page', month:id=>new Intl.DateTimeFormat('en',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${id}-01T00:00:00Z`)),
    language:'日本語', chapter:'Article sections', theme:'Explore topic', guide:'Topic guide',
  }
};

import { slugify } from "./utils.mjs";

const topicDescriptions = {
  "ai-agents": {
    ja: "AIエージェントを業務に組み込む際に、どの仕事を任せ、どこに評価、承認、権限、監視を置くかを、公開資料と実装例から整理するテーマです。",
    en: "A topic for deciding which work to delegate to AI agents and where to place evaluation, approvals, permissions, and observability, using public documentation and concrete implementations."
  },
  "ai-strategy": {
    ja: "生成AIのUI、資料作成、音声、動画、営業、既存業務への導入で、用途ごとに何を比較し、どの運用条件を確認するかを整理するテーマです。",
    en: "A topic for comparing the design and operating conditions of generative AI across interfaces, presentations, voice, video, sales work, and existing business workflows."
  },
  "ai-workflows": {
    ja: "資料作成、営業、既存デスクトップ業務、AIとの共同作業を対象に、入力から成果物や更新操作へ進む工程をどこまで自動化し、どこに確認を残すかを整理するテーマです。",
    en: "A topic for deciding how far to automate workflows from input to deliverables or updates, and where to retain review across presentations, sales work, existing desktop systems, and human-AI collaboration."
  }
};

const topicGuides = {
  "ai-agents": {
    ja: {
      kicker: "導入判断の順序",
      title: "AIエージェントを業務へ入れる前に分ける四つの論点",
      intro:
        "このテーマでは、AIエージェントを「よく答えるか」だけで比べません。誰が何を実行し、どこで止め、何を確認するかを分けて読みます。",
      points: [
        {
          title: "任せる仕事と停止条件",
          body: "回答だけで終わる仕事か、顧客情報や社内データを更新する仕事かで、必要な停止条件と確認者は変わります。"
        },
        {
          title: "評価する対象",
          body: "最終回答だけでなく、道具の選択、実行順序、途中の成果物、失敗時の扱いを分けて評価する記事を集めています。"
        },
        {
          title: "承認と権限",
          body: "人が許可する操作、ポリシーで自動判定できる操作、実行してはならない操作を、モデルの能力とは別に扱います。"
        },
        {
          title: "状態と監視",
          body: "長時間の作業を任せる場合は、担当、進捗、根拠、再開条件を見られることが、単発のデモと異なる判断材料になります。"
        }
      ]
    },
    en: {
      kicker: "Adoption sequence",
      title: "Four questions to separate before putting AI agents into work",
      intro:
        "This topic does not compare AI agents only by answer quality. It separates who performs each step, where work must stop, and what must be checked in a real workflow.",
      points: [
        {
          title: "Work to delegate and stop conditions",
          body: "The required stop conditions and reviewers change when a task updates customer or internal data rather than ending with an answer."
        },
        {
          title: "What to evaluate",
          body: "The briefings separate final answers from tool selection, execution order, intermediate artifacts, and failure handling."
        },
        {
          title: "Approvals and permissions",
          body: "Human-approved actions, policy-evaluable actions, and prohibited actions are treated separately from model capability."
        },
        {
          title: "State and observability",
          body: "For long-running work, the ability to inspect ownership, progress, evidence, and resume conditions distinguishes an operating system from a one-off demo."
        }
      ]
    }
  },
  "ai-strategy": {
    ja: {
      kicker: "製品を業務へ入れる条件",
      title: "機能比較では見えない、生成AIプロダクトの導入条件",
      intro:
        "このテーマは、機能一覧ではなく、読者の入力、AIの出力、編集や承認をする人、既存システムのつながりから、製品が実務へ入る条件を読みます。",
      points: [
        {
          title: "入力をどこで受けるか",
          body: "会話、フォーム、既存の資料、外部データのどれを入口にするかで、必要な画面と確認の仕方が変わります。"
        },
        {
          title: "成果物をどう直すか",
          body: "回答を読むだけで終わるのか、資料、映像、業務記録として編集、比較、承認するのかを分けて扱います。"
        },
        {
          title: "導入条件を何で確かめるか",
          body: "品質だけでなく、利用可能な地域、接続先、運用中の責任分担、修正経路が揃うかを確認します。"
        }
      ]
    },
    en: {
      kicker: "Conditions for adoption",
      title: "What feature comparison misses when generative AI enters real work",
      intro:
        "This topic reads adoption conditions through the connection between a reader's input, AI output, the people who edit or approve it, and the existing systems around it, rather than through feature lists alone.",
      points: [
        {
          title: "Where input begins",
          body: "The necessary interface and review differ when work begins in chat, a form, existing materials, or external data."
        },
        {
          title: "How an artifact is revised",
          body: "The briefings distinguish reading an answer from editing, comparing, and approving a presentation, video, or business record."
        },
        {
          title: "How adoption conditions are checked",
          body: "The comparison includes availability, integrations, operational responsibilities, and correction paths alongside output quality."
        }
      ]
    }
  },
  "ai-workflows": {
    ja: {
      kicker: "成果物までの工程",
      title: "AIを使う仕事を、入力から更新操作まで一つの工程として読む",
      intro:
        "このテーマは、AIの下書きや要約を入口にせず、受け取った資料、生成する成果物、既存システムへの更新、人による確認を一続きの工程として扱います。",
      points: [
        {
          title: "入力と根拠を残す",
          body: "会議メモ、提案書、既存ファイルなどから何を読み取り、どの情報を根拠として残すかを明確にします。"
        },
        {
          title: "編集できる成果物にする",
          body: "文章の出力だけでなく、スライド、CRMの項目、既存画面の操作結果など、次の担当者が検査して直せる形を扱います。"
        },
        {
          title: "書き込み前に確認する",
          body: "外部システムを更新する前に、対象の照合、変更内容、承認者、停止時の扱いを分けます。"
        },
        {
          title: "判断を次の作業へ戻す",
          body: "人が直した点や例外は、その場の会話で終わらせず、次回に使える条件、評価、手順へ戻せるかを見ます。"
        }
      ]
    },
    en: {
      kicker: "From input to deliverable",
      title: "Read AI-enabled work as one workflow from input through updates",
      intro:
        "This topic does not stop at AI drafts or summaries. It treats source material, generated artifacts, updates to existing systems, and human review as one connected workflow.",
      points: [
        {
          title: "Retain inputs and evidence",
          body: "The briefings make clear what is read from meeting notes, proposals, or existing files and what information remains as evidence."
        },
        {
          title: "Produce an editable artifact",
          body: "They cover not only text output but also slides, CRM fields, and existing-screen actions that the next owner can inspect and revise."
        },
        {
          title: "Check before writing",
          body: "Before an external system changes, the workflow separates record matching, the proposed change, the approver, and stop handling."
        },
        {
          title: "Return decisions to the next workflow",
          body: "The question is whether human corrections and exceptions can become reusable conditions, evaluations, or procedures instead of ending in one conversation."
        }
      ]
    }
  }
};

function createStableSlugMap(categories) {
  const used = new Set();
  const slugMap = new Map();

  for (const category of [...categories].sort((left, right) => left.localeCompare(right))) {
    const baseSlug = slugify(category) || "topic";
    let slug = baseSlug;
    let suffix = 2;

    while (used.has(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    used.add(slug);
    slugMap.set(category, slug);
  }

  return slugMap;
}

function normalizedTopicToken(value) {
  return slugify(value).replace(/-agents$/, "-agent");
}

function isGenericTag(tag, category) {
  const normalizedTag = normalizedTopicToken(tag);
  const normalizedCategory = normalizedTopicToken(category);
  return normalizedTag === "roundup" || normalizedTag === normalizedCategory;
}

function representativeTags(articles, category) {
  const tagStats = new Map();

  for (const article of articles) {
    for (const tag of article.tags) {
      const current = tagStats.get(tag) ?? { count: 0, latestDate: article.date };
      tagStats.set(tag, {
        count: current.count + 1,
        latestDate: current.latestDate > article.date ? current.latestDate : article.date
      });
    }
  }

  const sorted = [...tagStats.entries()].sort(
    (left, right) =>
      right[1].count - left[1].count ||
      right[1].latestDate.localeCompare(left[1].latestDate) ||
      left[0].localeCompare(right[0])
  );
  const filtered = sorted.filter(([tag]) => !isGenericTag(tag, category));
  return (filtered.length > 0 ? filtered : sorted).slice(0, 6).map(([tag]) => tag);
}

function topicDescription(slug, category) {
  return (
    topicDescriptions[slug] ?? {
      ja: `${category} に関する公開レポートを、主要論点ごとにまとめたテーマハブです。`,
      en: `A topic hub grouping published briefings in ${category} around the main practical questions.`
    }
  );
}

export function buildTopicHubs(articles) {
  const categories = [...new Set(articles.map((article) => article.category))];
  const slugMap = createStableSlugMap(categories);

  return categories
    .map((category) => {
      const hubArticles = articles.filter((article) => article.category === category);
      const slug = slugMap.get(category);
      const latestArticle = hubArticles[0] ?? null;
      const latestModified =
        hubArticles.reduce(
          (latest, article) => (!latest || article.lastModified.localeCompare(latest) > 0 ? article.lastModified : latest),
          ""
        ) || latestArticle?.lastModified;

      return {
        category,
        slug,
        articles: hubArticles,
        articleCount: hubArticles.length,
        latestArticle,
        latestModified,
        representativeTags: representativeTags(hubArticles, category),
        descriptions: topicDescription(slug, category),
        guide: topicGuides[slug] ?? null
      };
    })
    .sort(
      (left, right) =>
        right.articleCount - left.articleCount ||
        right.latestModified.localeCompare(left.latestModified) ||
        left.category.localeCompare(right.category)
    );
}

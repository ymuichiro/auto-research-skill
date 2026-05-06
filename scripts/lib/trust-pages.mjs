import { trustPageOrder, trustPagePaths } from "./site-config.mjs";

const repositoryUrl = "https://github.com/ymuichiro/auto-research-skill";
const issuesUrl = `${repositoryUrl}/issues/new`;
const lastReviewed = "2026-05-06T00:00:00Z";

function localizedText(ja, en) {
  return { ja, en };
}

function noticeBody(locale) {
  return locale === "ja"
    ? "このページは 2026-05-06 時点の公開運用をもとに記載しています。公開面の運用を変える場合は、この説明も合わせて更新します。"
    : "This page describes the current public operation of Auto Research Digest as of 2026-05-06. If the public operation changes, this explanation is updated as well.";
}

const trustPages = {
  about: {
    schemaType: "AboutPage",
    title: localizedText("このサイトについて", "About"),
    description: localizedText(
      "Auto Research Digest の目的、対象読者、公開範囲を説明します。",
      "Explaining the purpose, audience, and publishing scope of Auto Research Digest."
    ),
    heading: localizedText("Auto Research Digest について", "About Auto Research Digest"),
    intro: localizedText(
      "LLM、AI、AI Agent の動きを、一次情報ベースで整理するための公開リサーチサイトです。",
      "A public research publication that organizes LLM, AI, and AI agent developments through primary-source reporting."
    ),
    noticeTitle: localizedText("運用メモ", "Operational note"),
    sections: {
      ja: [
        {
          title: "何を公開するサイトか",
          paragraphs: [
            "Auto Research Digest は、LLM、AI、AI Agent に関する発表、論文、実装シグナルを横断し、実務判断に必要な論点を短時間で把握できるよう整理して公開します。",
            "想定読者は、事業責任者、企画、プロダクト、技術、運用など、意思決定や導入判断に関わる読者です。ニュースの速さよりも、公開資料から何を確認できるかを優先します。"
          ],
          bullets: [
            "公開面では、公式ドキュメント、ベンダー公式 announcement / release / launch / product update、論文など、一次情報として確認できる根拠を中心に扱います。",
            "日本語版と英語版は、論旨と責任範囲をそろえて運用します。",
            "単なる話題列挙ではなく、何が変わったのか、何が根拠か、実務判断にどう関係するかを整理します。"
          ]
        },
        {
          title: "どのように記事を作るか",
          paragraphs: [
            "トピック探索は広く行いますが、公開ページで根拠として掲示するのは、公式ドキュメントまたは論文として直接確認できた資料だけです。",
            "新規記事や大きな改稿に進む前に、対象テーマについて十分な一次情報インベントリを集め、公開根拠欄には検証済みの URL のみを載せます。根拠が薄い場合は、公開を急がず保留します。"
          ]
        },
        {
          title: "このサイトがしないこと",
          paragraphs: [
            "特定企業や製品を根拠なく推奨したり、逆に断定的に否定したりすることは避けます。本文では、確認できた事実、観測される傾向、含意や示唆を分けて書きます。",
            "アフィリエイト前提の製品比較、スポンサー都合のランキング、未検証の噂の拡散は、このサイトの公開方針に含めません。"
          ]
        }
      ],
      en: [
        {
          title: "What the site publishes",
          paragraphs: [
            "Auto Research Digest publishes briefings that connect launches, papers, and implementation signals across LLM, AI, and AI agent ecosystems so readers can grasp the practical decision points quickly.",
            "The intended audience includes business, product, technical, and operations readers who need to evaluate adoption and execution choices. Speed matters, but verified public evidence matters more."
          ],
          bullets: [
            "Public evidence is centered on official documentation, vendor-published announcement or release pages, and papers that can be verified directly.",
            "Japanese and English editions are kept aligned in meaning and responsibility.",
            "The goal is not a news dump, but a clear view of what changed, what the evidence is, and why it matters in practice."
          ]
        },
        {
          title: "How articles are produced",
          paragraphs: [
            "Topic discovery is broad, but the evidence shown on public pages is limited to materials that can be verified directly as official documents or papers.",
            "Before a new article or substantial rewrite is published, the editorial workflow builds a primary-source inventory for the topic and limits the public evidence list to verified URLs. When the evidence is still thin, publication is held back."
          ]
        },
        {
          title: "What this site does not do",
          paragraphs: [
            "The site avoids unsupported endorsements, unsupported criticism, and rhetoric that treats speculation as fact. Articles separate confirmed facts, observed patterns, and implications.",
            "Affiliate-style comparison pages, sponsor-driven rankings, and rumor-driven coverage are outside the public publishing model for this site."
          ]
        }
      ]
    }
  },
  editorialPolicy: {
    schemaType: "WebPage",
    title: localizedText("調査・編集方針", "Editorial Policy"),
    description: localizedText(
      "Auto Research Digest の調査基準、公開根拠、更新と訂正の考え方を示します。",
      "Explaining the research standards, evidence rules, and correction approach for Auto Research Digest."
    ),
    heading: localizedText("調査・編集方針", "Editorial Policy"),
    intro: localizedText(
      "公開ページの信頼性を保つため、探索段階と公開根拠の段階を明確に分けて運用します。",
      "To keep public pages reliable, the workflow separates broad discovery from the evidence allowed on published pages."
    ),
    noticeTitle: localizedText("公開基準", "Publishing standard"),
    sections: {
      ja: [
        {
          title: "調査対象と公開根拠",
          paragraphs: [
            "トピック探索では、ニュース、ブログ、SNS、イベントメモなどを手がかりに使うことがありますが、公開面の根拠一覧には載せません。公開根拠に採用するのは、公式ドキュメント、公式 announcement / release / launch / product update、論文など、原典として確認できる資料です。",
            "新規記事または大幅改稿では、対象テーマについて 20 件以上の一次情報 URL を集めることを基本条件にし、本文の主要な主張がその範囲で説明できる状態で公開します。"
          ],
          bullets: [
            "publishedSources には、公開ページで直接示してよい一次情報だけを載せます。",
            "第三者メディアや二次まとめは探索には使っても、公開根拠としては使いません。",
            "遡及記事では、記事日付以前に公開されていた一次情報だけを採用します。"
          ]
        },
        {
          title: "執筆と表現のルール",
          paragraphs: [
            "本文では、中立的な編集誌面を保ち、誇張や断定調を避けます。確定した事実、観測される傾向、推定や含意を混ぜずに書くことを優先します。",
            "構成は、何が起きているか、何が変わったのか、何が根拠なのか、実務判断にどう関係するか、という順で整理することを基本とします。"
          ],
          bullets: [
            "根拠欄に載せていない情報を、既知の事実のように断定しません。",
            "日英版は直訳ではなくても、論旨と温度感をそろえます。",
            "公開頻度は品質基準を下げる理由にしません。"
          ]
        },
        {
          title: "更新と訂正",
          paragraphs: [
            "既存記事を更新するときは、根拠リンクの有効性と本文の整合を見直します。新しい公式資料で論点が変わる場合は、旧来の説明を惰性的に残しません。",
            "公開後に誤記、リンク切れ、説明不足、翻訳差分などを確認した場合は、内容の性質に応じて修正します。修正判断は、正確性と読者理解への影響を基準に行います。"
          ]
        }
      ],
      en: [
        {
          title: "Research scope and public evidence",
          paragraphs: [
            "Topic discovery may use news reports, blogs, social posts, or event notes as signals, but those materials are not shown as public evidence. The public evidence list is limited to materials that can be verified as official documentation, vendor-published announcement or release pages, or papers.",
            "For new articles or substantial rewrites, the working standard is to collect at least 20 primary-source URLs for the topic and publish only when the main claims in the article can be explained within that evidence base."
          ],
          bullets: [
            "publishedSources is reserved for primary evidence that can be shown directly on the public page.",
            "Third-party media and recap pages may help discovery, but they are not used as public evidence.",
            "Retrospective articles only rely on primary sources that were publicly available by the article date."
          ]
        },
        {
          title: "Writing and expression rules",
          paragraphs: [
            "The public tone stays neutral and avoids hype, overstatement, and unsupported certainty. Confirmed facts, observed patterns, and implications are written as different things, not collapsed into one claim.",
            "Articles are generally structured around what happened, what changed, what the evidence is, and why that matters for operational or business decisions."
          ],
          bullets: [
            "Information that is not backed by the published evidence list is not presented as settled fact.",
            "Japanese and English versions stay aligned in meaning and tone even when they are not literal translations.",
            "Publishing cadence is not treated as a reason to lower the evidence threshold."
          ]
        },
        {
          title: "Updates and corrections",
          paragraphs: [
            "When an existing article is updated, source links and article claims are reviewed together. If new official material changes the frame, older wording is not kept by inertia.",
            "If a typo, broken link, translation mismatch, or explanation gap is found after publication, the page can be revised according to the nature and impact of the issue. Accuracy and reader understanding drive that decision."
          ]
        }
      ]
    }
  },
  contact: {
    schemaType: "ContactPage",
    title: localizedText("お問い合わせ", "Contact"),
    description: localizedText(
      "Auto Research Digest への連絡方法と受け付ける内容を案内します。",
      "Explaining how to contact Auto Research Digest and what kinds of inquiries fit the site."
    ),
    heading: localizedText("お問い合わせ", "Contact"),
    intro: localizedText(
      "現在の公開窓口は GitHub を中心に運用しています。訂正依頼、リンク不備、運用上の問い合わせはこちらで確認します。",
      "The current public contact channel is centered on GitHub. Correction requests, broken links, and operational questions are reviewed there."
    ),
    noticeTitle: localizedText("公開窓口", "Public contact channel"),
    sections: {
      ja: [
        {
          title: "連絡に使う窓口",
          paragraphs: [
            "現時点では、公開連絡窓口として GitHub repository を利用しています。サイト上に専用フォームやニュースレター登録は設けていません。",
            "内容に応じて、Issue での報告、または repository 上の pull request による軽微な修正提案を想定しています。"
          ],
          resources: [
            {
              label: "GitHub Issues",
              url: issuesUrl,
              description: "誤記、リンク切れ、表現差分、公開ポリシーに関する指摘や相談を受け付ける窓口です。"
            },
            {
              label: "Repository",
              url: repositoryUrl,
              description: "公開ソースや変更履歴を確認したい場合の参照先です。軽微な修正提案が可能な場合は pull request も利用できます。"
            }
          ]
        },
        {
          title: "受け付ける内容",
          bullets: [
            "事実誤認、表記揺れ、翻訳差分、リンク切れなどの修正依頼",
            "プライバシーポリシー、免責事項、広告掲載方針など公開ポリシーに関する問い合わせ",
            "このサイトの公開方針と整合する範囲での業務連絡や協業相談"
          ],
          paragraphs: [
            "内容によっては、詳細確認に時間がかかることがあります。また、営業目的やサイト方針と関係の薄い提案には、個別返信を行わない場合があります。"
          ]
        },
        {
          title: "返信の考え方",
          paragraphs: [
            "返信 SLA は設けていませんが、公開面の正確性や運用上の重要度が高いものから確認します。",
            "日本語と英語のどちらでも受け付けますが、公開修正時は両言語版の整合を確認した上で反映します。"
          ]
        }
      ],
      en: [
        {
          title: "Channels used for contact",
          paragraphs: [
            "At the moment, the public contact channel is the GitHub repository. The site does not currently offer a dedicated contact form or newsletter signup on the public pages.",
            "Depending on the issue, the expected channel is either a GitHub issue report or a lightweight correction proposal through the repository."
          ],
          resources: [
            {
              label: "GitHub Issues",
              url: issuesUrl,
              description: "Use this channel for factual corrections, broken links, translation mismatches, or questions about the public policies."
            },
            {
              label: "Repository",
              url: repositoryUrl,
              description: "Use this reference when you need to inspect the public source or change history. Lightweight correction proposals may also fit the repository workflow."
            }
          ]
        },
        {
          title: "What kinds of inquiries fit",
          bullets: [
            "Requests to correct factual errors, wording issues, translation gaps, or broken links",
            "Questions about public policies such as the Privacy Policy, Disclaimer, or Advertising Policy",
            "Legitimate operational or collaboration inquiries that fit the scope and publishing model of this site"
          ],
          paragraphs: [
            "Some requests require verification and may take time to review. Sales outreach or proposals that do not fit the publishing scope may not receive an individual response."
          ]
        },
        {
          title: "How responses are handled",
          paragraphs: [
            "There is no guaranteed response SLA, but issues that affect public accuracy or site operation are prioritized.",
            "Both Japanese and English are accepted. When a public correction is made, both language versions are reviewed for consistency."
          ]
        }
      ]
    }
  },
  privacyPolicy: {
    schemaType: "WebPage",
    title: localizedText("プライバシーポリシー", "Privacy Policy"),
    description: localizedText(
      "公開サイトとしての個人情報の扱いと、閲覧時に関係する第三者サービスを説明します。",
      "Explaining how personal information is handled on the public site and which third-party services are involved in normal browsing."
    ),
    heading: localizedText("プライバシーポリシー", "Privacy Policy"),
    intro: localizedText(
      "このページは、Auto Research Digest の公開面で想定される情報の扱いを、現在の運用に沿って説明するものです。",
      "This page explains how information is handled on the public face of Auto Research Digest based on the current operating model."
    ),
    noticeTitle: localizedText("公開面の前提", "Public-site baseline"),
    sections: {
      ja: [
        {
          title: "本サイトが直接収集する情報",
          paragraphs: [
            "公開ページの閲覧自体に、会員登録、コメント機能、問い合わせフォーム、ニュースレター登録は必要ありません。現時点では、サイト自身が名前やメールアドレスを直接受け取る仕組みは常設していません。",
            "ただし、GitHub Issues や pull request など、外部サービス上で連絡を行う場合は、そのサービス事業者の仕組みとポリシーに従って情報が取り扱われます。"
          ]
        },
        {
          title: "閲覧時に関係する技術要素",
          bullets: [
            "ホスティングや配信基盤では、配信、障害対応、セキュリティ保護のために、IP アドレス、User-Agent、参照元、アクセス時刻などの標準的なアクセス情報が処理されることがあります。",
            "公開ページでは Google Fonts を利用しているため、フォント取得時の通信は Google のインフラを経由します。",
            "記事の共有ボタンは、利用者が押したときだけブラウザの share / clipboard API を利用します。通常閲覧中にこのサイトがその操作を勝手に実行することはありません。"
          ],
          paragraphs: [
            "また、記事から外部の公式ドキュメントや論文ページへ移動した後の情報の扱いは、リンク先サービスのポリシーによって決まります。"
          ]
        },
        {
          title: "利用目的と今後の変更",
          paragraphs: [
            "上記の情報は、公開ページの配信、保守、セキュリティ対応、利用状況の最低限の把握といった運用目的の範囲で扱われることを想定しています。現時点では、公開ページに独自の広告タグ、会員トラッキング、フォーム型の個人情報取得機能は実装していません。",
            "今後、広告、分析、問い合わせ導線などを追加し、利用者への説明が必要になる場合は、このページの記載を更新した上で公開面へ反映します。"
          ]
        }
      ],
      en: [
        {
          title: "Information the site collects directly",
          paragraphs: [
            "Browsing the public pages does not require account registration, comments, a contact form, or newsletter signup. Under the current setup, the site does not maintain a standing mechanism to collect names or email addresses directly on the public pages.",
            "However, when contact happens through external services such as GitHub issues or pull requests, information is handled under the systems and policies of those service providers."
          ]
        },
        {
          title: "Technical elements involved in normal browsing",
          bullets: [
            "Hosting and delivery infrastructure may process standard access information such as IP address, user agent, referrer, and request time for delivery, troubleshooting, and security purposes.",
            "The public pages use Google Fonts, so font requests are served through Google's infrastructure.",
            "Share controls use browser share or clipboard APIs only when a visitor actively clicks them. The site does not trigger those actions silently during ordinary browsing."
          ],
          paragraphs: [
            "Once a visitor follows a link to an external official document or paper page, information handling is governed by the destination service rather than this site."
          ]
        },
        {
          title: "Operational purpose and future changes",
          paragraphs: [
            "The information above is understood to be used for public-page delivery, maintenance, security response, and minimal operational awareness. At the moment, the public pages do not include custom advertising tags, membership tracking, or form-based personal data collection.",
            "If the site later adds advertising, analytics, or a direct contact workflow that changes what visitors should know, this page will be updated before or together with the public rollout."
          ]
        }
      ]
    }
  },
  terms: {
    schemaType: "WebPage",
    title: localizedText("利用規約", "Terms"),
    description: localizedText(
      "Auto Research Digest の公開ページを利用する際の基本的な考え方を示します。",
      "Explaining the basic operating terms for using the public pages of Auto Research Digest."
    ),
    heading: localizedText("利用規約", "Terms"),
    intro: localizedText(
      "このページは、公開サイトの利用にあたって共有したい運用上の前提をまとめたものです。",
      "This page summarizes the operating assumptions that matter when using the public site."
    ),
    noticeTitle: localizedText("利用の前提", "Use baseline"),
    sections: {
      ja: [
        {
          title: "公開情報としての利用",
          paragraphs: [
            "本サイトの内容は、LLM、AI、AI Agent に関する公開情報を整理した編集コンテンツとして提供します。個別の導入判断や契約判断にあたっては、必ず原典や正式な契約文書を確認してください。",
            "公開中の記事、方針ページ、根拠一覧は、将来の更新や公開停止により内容が変わることがあります。"
          ]
        },
        {
          title: "避けてほしい利用",
          bullets: [
            "サイト運用を妨げる行為、違法行為、第三者の権利を侵害する形での利用",
            "本サイトの名称や編集方針を、無関係な第三者が公式見解であるかのように誤認させる行為",
            "引用元や責任主体を隠したまま、公開コンテンツ全体を転載・再配布する行為"
          ],
          paragraphs: [
            "正当な引用、参照、リンクは、出典や責任主体が分かる形で行われることを想定しています。"
          ]
        },
        {
          title: "内容変更とサービス継続",
          paragraphs: [
            "公開ページの構成、URL、掲載内容、外部リンクは、編集上または運用上の理由で見直されることがあります。",
            "継続的な提供に努めますが、保守、更新、障害、外部要因などにより一時的に利用できない場合があります。"
          ]
        }
      ],
      en: [
        {
          title: "Use as public information",
          paragraphs: [
            "The site is provided as editorial content that organizes public information about LLM, AI, and AI agents. For adoption, contractual, or other consequential decisions, readers should confirm the original source materials and any formal documents directly.",
            "Published articles, policy pages, and evidence lists may change over time or be removed as the site is updated."
          ]
        },
        {
          title: "Uses to avoid",
          bullets: [
            "Using the site in ways that disrupt operations, break the law, or infringe third-party rights",
            "Misrepresenting the site's name, editorial posture, or content as if it were an official position of an unrelated third party",
            "Republishing or redistributing the site's public content in full while obscuring source attribution or responsibility"
          ],
          paragraphs: [
            "Normal quotation, reference, and linking are expected to preserve clear attribution and responsibility."
          ]
        },
        {
          title: "Content changes and availability",
          paragraphs: [
            "Page structure, URLs, published content, and external links may be revised for editorial or operational reasons.",
            "The site aims to remain available, but maintenance, updates, incidents, or external dependencies can temporarily affect access."
          ]
        }
      ]
    }
  },
  disclaimer: {
    schemaType: "WebPage",
    title: localizedText("免責事項", "Disclaimer"),
    description: localizedText(
      "公開情報の性質、責任範囲、外部リンクの扱いについて説明します。",
      "Explaining the nature of the public information, the responsibility boundary, and how external links are treated."
    ),
    heading: localizedText("免責事項", "Disclaimer"),
    intro: localizedText(
      "本サイトの情報は、公開時点で確認できる資料をもとに整理した編集コンテンツです。",
      "The site provides editorial content organized from materials that were publicly verifiable at the time of publication."
    ),
    noticeTitle: localizedText("責任範囲", "Responsibility boundary"),
    sections: {
      ja: [
        {
          title: "情報提供の範囲",
          paragraphs: [
            "本サイトは、一般的な情報提供を目的としており、法律、会計、税務、投資、医療、セキュリティ、その他の専門助言を提供するものではありません。",
            "記事や方針ページは、公開時点で確認できる資料に基づきますが、その後の発表、仕様変更、リンク切れ、制度変更などにより状況が変わることがあります。"
          ]
        },
        {
          title: "正確性と完全性について",
          paragraphs: [
            "正確性の確保に努めますが、すべての情報が常に完全、最新、または特定用途に適合することを保証するものではありません。",
            "特に導入判断や実装判断では、記事本文だけで完結させず、必ず公開根拠欄の原典や公式ドキュメントを確認してください。"
          ]
        },
        {
          title: "外部リンクと利用判断",
          paragraphs: [
            "本サイトは、根拠確認や参照のために外部サイトへリンクすることがありますが、リンク先の内容、可用性、運用方針までは管理していません。",
            "本サイトの情報を利用した判断や行動は、利用者自身の確認と責任のもとで行うことを前提とします。"
          ]
        }
      ],
      en: [
        {
          title: "Scope of information provided",
          paragraphs: [
            "The site is intended for general informational use. It does not provide legal, accounting, tax, investment, medical, security, or other professional advice.",
            "Articles and policy pages are based on materials that were publicly verifiable when prepared, but circumstances can change as new releases, specification changes, broken links, or policy changes occur."
          ]
        },
        {
          title: "Accuracy and completeness",
          paragraphs: [
            "The site aims for accuracy, but it does not guarantee that every page is always complete, current, or suitable for a specific purpose.",
            "For adoption or implementation decisions, readers should not rely on article text alone and should verify the primary materials linked in the public evidence section."
          ]
        },
        {
          title: "External links and decision-making",
          paragraphs: [
            "The site may link to external pages to support verification and reference, but it does not control the content, availability, or operating policies of those destinations.",
            "Any decision or action taken using the site's content is expected to be made under the reader's own review and responsibility."
          ]
        }
      ]
    }
  },
  advertisingPolicy: {
    schemaType: "WebPage",
    title: localizedText("広告掲載方針", "Advertising Policy"),
    description: localizedText(
      "広告やスポンサー表記を導入する場合の考え方と、編集独立性の扱いを説明します。",
      "Explaining how advertising or sponsorship would be handled and how editorial independence is maintained."
    ),
    heading: localizedText("広告掲載方針", "Advertising Policy"),
    intro: localizedText(
      "広告審査や将来の導線整備を見据えつつ、現時点の公開面では編集独立性と読者への明示を優先します。",
      "While the site prepares for future monetization or review requirements, the current public priority is editorial independence and clear reader notice."
    ),
    noticeTitle: localizedText("現状の運用", "Current operation"),
    sections: {
      ja: [
        {
          title: "現時点の広告運用",
          paragraphs: [
            "2026-05-06 時点の公開面には、第三者の広告タグ、AdSense コード、アフィリエイト計測コードを常設していません。",
            "このページは、将来広告やスポンサー導線を追加する場合に備え、どのような前提で運用するかを先に公開するためのものです。"
          ]
        },
        {
          title: "編集独立性",
          bullets: [
            "記事テーマの選定、論旨、見出し、結論は、編集判断を優先します。",
            "スポンサー提供がある場合でも、そのことを公開面で識別できるように明示します。",
            "スポンサー案件や広告枠が将来入る場合でも、公開根拠の基準は通常記事と同じく一次情報中心で維持します。"
          ],
          paragraphs: [
            "広告主や関係企業が、通常の編集記事の結論を事前承認する前提では運用しません。"
          ]
        },
        {
          title: "将来追加する場合の扱い",
          paragraphs: [
            "将来、ディスプレイ広告、スポンサー表記、アフィリエイトリンク、その他の収益導線を導入する場合は、編集コンテンツと識別できる形で分離し、利用者の理解を妨げない配置を優先します。",
            "広告導入によってプライバシーポリシーやお問い合わせページの説明が変わる場合は、関連ページも合わせて更新します。"
          ]
        }
      ],
      en: [
        {
          title: "Current advertising setup",
          paragraphs: [
            "As of 2026-05-06, the public site does not include standing third-party advertising tags, AdSense code, or affiliate tracking code.",
            "This page exists to state the operating baseline in advance in case advertising, sponsorship, or other monetization surfaces are added later."
          ]
        },
        {
          title: "Editorial independence",
          bullets: [
            "Topic selection, framing, headlines, and conclusions remain editorial decisions.",
            "If sponsorship is introduced, the relationship is disclosed in a way readers can identify on the public page.",
            "If sponsored placements or ad inventory are added later, the public evidence standard remains primary-source driven in the same way as ordinary editorial articles."
          ],
          paragraphs: [
            "Advertisers or related companies are not assumed to pre-approve the conclusions of ordinary editorial articles."
          ]
        },
        {
          title: "How future additions would be handled",
          paragraphs: [
            "If the site later introduces display advertising, sponsorship labels, affiliate links, or another revenue path, those elements will be separated from editorial content in a way that remains understandable to readers.",
            "If advertising changes what visitors should know about privacy or contact handling, the related policy pages will be updated alongside that rollout."
          ]
        }
      ]
    }
  }
};

export function trustPageRelativePath(pageId, locale) {
  const localizedPath = trustPagePaths[pageId];

  if (!localizedPath) {
    throw new Error(`Unknown trust page: ${pageId}`);
  }

  return locale === "ja" ? localizedPath : `en/${localizedPath}`;
}

export function trustPageForLocale(pageId, locale) {
  const page = trustPages[pageId];

  if (!page) {
    throw new Error(`Unknown trust page content: ${pageId}`);
  }

  return {
    id: pageId,
    relativePath: trustPageRelativePath(pageId, locale),
    schemaType: page.schemaType,
    title: page.title[locale],
    description: page.description[locale],
    heading: page.heading[locale],
    intro: page.intro[locale],
    noticeTitle: page.noticeTitle[locale],
    noticeBody: noticeBody(locale),
    sections: page.sections[locale],
    lastModified: lastReviewed
  };
}

export function trustPagesForLocale(locale) {
  return trustPageOrder.map((pageId) => trustPageForLocale(pageId, locale));
}

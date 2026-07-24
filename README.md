# Portfolio Site

## 概要

エンジニアとして制作したアプリケーションや学習記録をまとめたポートフォリオサイトです。

React・Firebaseを用いて開発し、作品紹介だけでなく管理画面から投稿の追加・編集・削除が行えるようにしました。

また、GitHubリポジトリのREADMEを自動取得して表示する機能や、VoiceOver・Lighthouseを活用したアクセシビリティ改善にも取り組んでいます。

---

## 制作背景

制作物が増えるにつれて、HTMLを書き換えて更新するポートフォリオでは管理が煩雑になり、手間がかかってしまうと感じ、管理画面から更新できるポートフォリオサイトを制作しました。

投稿データはFirestoreで管理し、サイトにログインすると投稿の削除や更新ができるようにしています。

また、「作品を並べるだけ」ではなく、制作背景や工夫した点まで伝えられるサイトを目指し、GitHub READMEの自動表示機能やアクセシビリティへの取り組みを取り入れました。

---

## デモ

### 公開URL

https://portfolio-react-rho-snowy.vercel.app/

### GitHub

https://github.com/aachan1127/portfolio-react

---

## スクリーンショット

### トップページ

（画像）

### 投稿一覧

（画像）

### 投稿詳細

（画像）

### 管理画面

（画像）

---

## 主な機能

- 投稿一覧表示
- 投稿詳細表示
- 投稿の追加・編集・削除（CRUD）
- Firebase Authenticationによるログイン認証
- Firestoreによるデータ管理
- Firebase Storageによる画像アップロード
- GitHub READMEの自動取得・表示
- YouTube埋め込み表示
- タグによる絞り込み
- 表示順の変更
- レスポンシブ対応
- アクセシビリティ対応

---

## 使用技術

| 分類 | 技術 |
|------|------|
| Frontend | React |
| Routing | React Router |
| Backend | Firebase |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |
| Storage | Firebase Storage |
| Hosting | Vercel |
| Markdown | React Markdown |
| Library | remark-gfm |
| Version Control | Git / GitHub |

---

## システム構成

```text
ユーザー

      │

      ▼

React

      │

      ▼

Firebase Authentication

      │

      ▼

Cloud Firestore

      │

      ▼

Firebase Storage
```

### README取得の流れ

```text
GitHub Repository

      │

      ▼

README.md

      │

      ▼

raw.githubusercontent.com

      │

      ▼

React Markdown

      │

      ▼

ポートフォリオサイト
```

---

# 工夫した点

## GitHub READMEの自動取得
作品を更新した際の、投稿詳細画面での説明文の書き換えの手間を省くために、

投稿時にGitHubリポジトリURLを登録すると、そのリポジトリのREADME.mdを取得し、React Markdownで表示する仕組みを実装しました。

こちらは、READMEをGitHub側で更新するだけでポートフォリオにも反映されるため、管理がしやすくなるように工夫しました。

READMEを表示させるか、自分で直接記載したものを表示させるかは、管理画面で選択できるようにしています。

---

## アクセシビリティ

より多くの人が閲覧しやすいサイトを目指し、アクセシビリティ改善に取り組みました。

実施した内容

- VoiceOverによる操作確認
- LighthouseによるAccessibilityチェックの実施
- Claude Cowork によるアクセシビリティチェックの実施
- WAVEによるセマンティック構造のチェック
- 見出しレベルの見直し
- alt属性の改善
- キーボード操作への対応
- フォーカス表示の改善
- コントラストの改善

---

## UI / UX

使いやすさを意識し、以下のような改善を行いました。

- 投稿カードのホバーアニメーション
- 画像拡大表示
- レスポンシブデザイン
- タグ表示
- 投稿順位の管理（タグによる絞り込み）

---

## コンポーネント設計

コンポーネントを役割ごとに分割し、再利用しやすい構成を意識しました。

---

# 苦労したこと・解決方法

## GitHub README表示

### 課題

GitHub上のREADMEをそのまま表示したいと考えました。

### 解決方法

GitHub APIではなく、raw.githubusercontent.comからREADME.mdを取得し、React Markdownで表示する仕組みを実装しました。

---

## アクセシビリティ改善

### 課題

VoiceOverで投稿カードの内容が適切に読み上げられない問題がありました。

### 解決方法

- aria-labelの追加
- 見出し構造の修正
- alt属性の見直し
- フォーカス管理の改善

を行い、スクリーンリーダーでも利用しやすいよう改善しました。

---

# 今後改善したいこと

- 検索機能
- ダークモード
- テストコードの追加
- ページネーション
（投稿数が増えた場合に備え、Firestoreの`limit`と`startAfter`を使用したページネーションを実装する）
- GitHub API対応
（GitHub APIを利用して、READMEだけでなく使用言語や最終更新日などのリポジトリ情報も表示する）
- パフォーマンス改善
（画像の圧縮・遅延読み込みや、Firestoreの取得クエリの見直しによって表示速度を改善する）
- CI/CDの導入
（GitHub Actionsを使用し、push時にESLint・テスト・ビルド確認を自動実行する・CDは実装済み）
- キャッシュ対応
（GitHub READMEや投稿データをキャッシュし、同じデータへの不要な再通信を減らす）
---

# セットアップ方法

## Clone

```bash
git clone https://github.com/aachan1127/portfolio-react
```

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

---

## 環境変数

`.env`

```env
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```

---

# ディレクトリ構成

```text
src
├── components
├── lib
├── assets
├── utils
├── App.jsx
├── main.jsx
```

---

# 開発で大切にしたこと

このポートフォリオでは、「作品を公開すること」だけでなく、保守性・アクセシビリティ・運用性を意識して開発しました。

特に、GitHub READMEとの連携による情報管理や、VoiceOver・Lighthouseを活用したアクセシビリティ改善を継続して行っています。

今後も改善を続けながら、より使いやすく保守しやすいアプリケーションへ成長させていきたいと考えています。

---

# 作者

**山本 明音**

GitHub

https://github.com/aachan1127

Portfolio

https://portfolio-react-rho-snowy.vercel.app/

X

https://x.com/aachan_y27
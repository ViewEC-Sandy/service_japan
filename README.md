# ViewEC Corp. 日本市場服務方案網站 V6

## 本版更新
- 「加值服務」全面改名為「單項服務」。
- 服務方案與單項服務可分別單獨購買，也可自由組合。
- 若已選方案包含相同單項服務，系統會避免重複計費。
- 訂單處理與出貨服務：NT$12,000／月（未稅）＋物流相關實際費用。
- 日文客服對應與評價管理：NT$15,000／月（未稅）。
- 廣告投放服務：依實際投放金額 × 10% 收取服務手續費（未稅）。
- 廣告素材可獨立選購：商品主圖 NT$1,300、主圖＋8張介紹圖 NT$10,000、Resize NT$1,000、品牌圖／Banner NT$1,000。
- 數據分析與報告製作：NT$1,000／則（未稅），每月限一次。
- 費用試算分為一次性服務費、每月服務費與其他實際支出。
- 保留 ViewEC Corp. 品牌名稱、方案比較、登入門檻與方案推薦互動。

## 預設登入帳密
- 帳號：`viewec`
- 密碼：`2026viewec`

請上線前修改 `script.js` 最上方的 `AUTH`。

## 登入安全性提醒
目前登入仍為前端 JavaScript 存取門檻。即使部署到 Firebase Hosting，也不等於 Firebase Authentication。若網站內容需要真正限制未授權使用者存取，請另外整合 Firebase Authentication 或其他後端／邊緣驗證方案。

## 部署
此專案可直接部署到 GitHub Pages，亦包含 `firebase.json` 可用 Firebase Hosting 部署。詳細步驟請見 `DEPLOYMENT.md`。


## Firebase Authentication 登入

本版本已改用 Firebase Authentication 的 Email/Password 登入，不再於 `script.js` 寫死帳號密碼。

- Firebase 專案：`japan-sevice`
- Firebase Web 設定：`firebase-config.js`
- 登入／登出：`auth.js`
- 使用者請至 Firebase Console → Authentication → Users 建立與管理。

> 注意：Firebase Authentication 能驗證使用者身分，但本專案仍為靜態網站。若需要讓未授權者連 HTML 原始內容都無法取得，需把敏感內容改由受 Security Rules 保護的 Firestore/Storage，或由受驗證的後端動態提供。

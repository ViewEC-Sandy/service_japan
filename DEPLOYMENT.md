# 部署備忘

## GitHub Pages
1. 建立或開啟 GitHub Repository。
2. 將本資料夾中的檔案放在 Repository 根目錄並 commit / push 到 `main`。
3. GitHub Repository → Settings → Pages。
4. Build and deployment → Source 選擇 **Deploy from a branch**。
5. Branch 選 `main`，Folder 選 `/(root)`，儲存。
6. 等待 GitHub Pages 完成部署後，以 Pages 顯示的網址開啟網站。

## Firebase Hosting
1. 在 Firebase Console 建立或選擇專案。
2. 安裝 Firebase CLI：`npm install -g firebase-tools`
3. 登入：`firebase login`
4. 在本資料夾執行：`firebase use --add`，選擇 Firebase Project。
5. 第一次若尚未建立 Hosting，可執行 `firebase init hosting`；本專案已附 `firebase.json`，請保留 public 目錄為 `.`，且不要覆寫 `index.html`。
6. 本機預覽可執行：`firebase emulators:start --only hosting`
7. 正式部署：`firebase deploy --only hosting`

## GitHub 與 Firebase 的關係
GitHub 適合保存與版本管理原始碼；Firebase Hosting 則可作為正式網站託管。若使用 Firebase Hosting，就不必再同時用 GitHub Pages 當正式網站。也可以進一步設定 GitHub Actions，讓 push 到 GitHub 後自動部署到 Firebase Hosting。


## Authentication

1. Firebase Console → Authentication → Sign-in method：確認 Email/Password 已啟用。
2. Authentication → Users：建立允許登入的 Email/Password。
3. 本版本已包含 `firebase-config.js` 與 `auth.js`，部署後即可使用 Firebase Authentication。
4. 若登入網址不是 Firebase Hosting 預設網域，請到 Authentication → Settings → Authorized domains 確認該網域已被允許。

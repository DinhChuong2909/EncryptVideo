const LitJsSdk = require("lit-js-sdk");
const ethConnect = require("@lit-protocol/auth-browser");
const ethers = require("ethers");

// Khởi tạo Lit Node Client
const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });

// Kết nối đến Lit node
async function connectToLitNode() {
  try {
    await litNodeClient.connect();
    console.log("Đã kết nối thành công với Lit node!");
  } catch (error) {
    console.error("Lỗi khi kết nối với Lit node:", error);
  }
}

// Lấy AuthSig từ MetaMask hoặc ví trình duyệt khác
async function getAuthSig() {
  try {
    authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: "ethereum" });
    return authSig;
  } catch (error) {
    console.error("Lỗi khi lấy AuthSig:", error);
    return null;
  }
}

// Tạo cặp khóa mới
async function generateKeyPair() {
  try {
    const keyPair = await litNodeClient.executeJs({
      code: `
        const keyPair = Lit.Crypto.generateKeyPair();
        keyPair;
      `,
    });
    console.log("Đã tạo cặp khóa:", keyPair);
  } catch (error) {
    console.error("Lỗi khi tạo cặp khóa:", error);
  }
}

// Lấy danh sách các cặp khóa hiện có
async function getExistingKeyPairs() {
  try {
    const existingKeys = await litNodeClient.executeJs({
      code: `
        const existingKeys = Lit.Crypto.getExistingKeys();
        existingKeys;
      `,
    });
    console.log("Danh sách các cặp khóa hiện có:", existingKeys);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách các cặp khóa:", error);
  }
}

const jwt = require("jsonwebtoken");

// Hàm xác minh AuthSig
function verifyAuthSig(authSig) {
  try {
    // Thay thế "process.env.JWTPRIVATEKEY" bằng khóa riêng của bạn
    const decoded = jwt.verify(authSig, 'eyJhbGciOiJCTFMxMi0zODEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJMSVQiLCJzdWIiOiIweGRiZDM2MGYzMDA5N2ZiNmQ5MzhkY2M4YjdiNjI4NTRiMzYxNjBiNDUiLCJjaGFpbiI6ImZhbnRvbSIsImlhdCI6MTYyODAzMTM1OCwiZXhwIjoxNjI4MDc0NTU4LCJiYXNlVXJsIjoiaHR0cHM6Ly9teS1keW5hbWljLWNvbnRlbnQtc2VydmVyLmNvbSIsInBhdGgiOiIvYV9wYXRoLmh0bWwiLCJvcmdJZCI6IiJ9.lX_aBSgGVYWd2FL6elRHoPJ2nab0IkmmX600cwZPCyK_SazZ-pzBUGDDQ0clthPVAtoS7roHg14xpEJlcSJUZBA7VTlPiDCOrkie_Hmulj765qS44t3kxAYduLhNQ-VN');
    console.log("AuthSig hợp lệ. Thông tin người dùng:", decoded);
    return true;
  } catch (error) {
    console.error("AuthSig không hợp lệ:", error.message);
    return false;
  }
}

// Gọi hàm xác minh


// Chạy các hàm ví dụ
const main = async () => {
  await connectToLitNode();
  const address = "0xAC62315338662a95B38c9B89733baF58163BFd32"; 
  await verifyAuthSig(address);
  const authSig = await getAuthSig();
  if (authSig) {
    generateKeyPair();
    getExistingKeyPairs();
  } else {
    console.error("Không thể lấy AuthSig. Vui lòng xác thực trước.");
  }
}

main();

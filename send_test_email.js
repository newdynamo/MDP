const emailService = require('./backend/services/emailService.js');

const recipient = "newdynamo77@daum.net"; // FuelEU Trader #2
const now = new Date();
const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().split(' ')[0];
const subject = `[Co-Fleeter] FuelEU RFQ Notification (${dateStr} ${timeStr})`;

const text = `FuelEU Transaction Notification / FuelEU 거래 알림

Please proceed with FuelEU Pooling.
FuelEU Pooling을 진행해주세요.

Please find the details below for the agreed contract.
합의된 계약에 대한 세부 내용은 아래와 같습니다.

[Contract Summary / 체결 요약]
Quantity (수량): 500
Unit Price (단가): €200.00
Total Price (총액): €100,000

[Buyer Information / 매수자 정보]
Company (회사): HYUNDAI LNG SHIPPING CO., LTD.
Name (이름): JOO SUNGJUN
Email (이메일): user@example.com
Phone (전화번호): +82-10-0000-0000

[Seller Information / 매도자 정보]
Company (회사): Seller Company Ltd.
Name (이름): John Seller
Email (이메일): seller@example.com
Phone (전화번호): +1-555-0199

Please facilitate the transaction process.
거래 진행 부탁드립니다.`;

emailService.sendEmail(recipient, subject, text);
console.log("Test email sent to " + recipient);

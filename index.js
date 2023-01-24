const fs = require('fs');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

const sms = require('./input/sms');

const config = require('./config');
const { htmlToText } = require('./lib/html');

const result = sms
    .map(v => {
        const direction = v.status === 0 ? 'come' : 'go';
        const send = {};
        const receive = {};
        if (direction === 'go') {
            // config.rightName = name;

            send.sender = config.rightNum;
            send.senderName = config.rightName;

            receive.receiver = v.recipients;
            receive.receiverName = config.leftName;
        }

        if (direction === 'come') {
            // config.leftName = name;

            send.sender = v.recipients;
            send.senderName = config.leftName;

            receive.receiver = config.rightNum;
            receive.receiverName = config.rightName;
        }

        const obj = {
            source: 'SMS',
            device: 'Phone',
            type: smsType(v.recipients, v.body),

            direction,

            ...send,
            ...receive,

            day: dayjs(v.localTime).format('YYYY-MM-DD'),
            time: dayjs(v.localTime).format('HH:mm:ss'),
            ms: v.localTime,

            content: htmlToText(v.body),
            html: v.body,

            $Dev: {
                msAccuracy: true,
            },
        };

        return obj;
    })
    .sort((a, b) => a.ms - b.ms);

function smsType(num, html) {
    if (isFeiXin(num)) {
        return '飞信';
    } else if (isCaiXin(html)) {
        return '彩信';
    } else {
        return '短信';
    }
}

function isFeiXin(num) {
    if (String(num).trim().startsWith('12520')) {
        return true;
    } else if (String(num).trim().startsWith('161')) {
        return true;
    } else {
        return false;
    }
}

function isCaiXin(html) {
    const $ = cheerio.load(html, { decodeEntities: false });
    return $('img').length !== 0;
}

console.log('数量', result.length);

fs.writeFileSync('./dist/sms_mi_com.json', JSON.stringify(result, null, 4));

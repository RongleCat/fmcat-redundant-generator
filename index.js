const fs = require('fs');

const { createCanvas, loadImage } = require('canvas')

const [chatText = '', theme = "light"] = process.argv.slice(2);
const { projectPath, headUrl } = process.env;
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');

const chatLineHeight = 42;
const globalPadding = 20;
const bubblePadding = [17, 26, 24];
const bubbleRightMargin = 10; // 气泡和头像的距离
const headSize = 64; // 头像大小

const bgColor = theme === 'light' ? '#f3f3f3' : '#111111'; // 背景颜色
const bubbleBgColor = theme === 'light' ? '#ffffff' : '#38b267'; // 气泡背景色
const arrowBg = theme === 'light' ? // 箭头颜色
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAQBAMAAADdUfNzAAAAJ1BMVEUAAAD///////////////////////////////////////////////+uPUo5AAAADHRSTlMAxZgZBuVmZDnkOjj2+7DuAAAANElEQVQI12NQYQCBgwYg8sxsMHmmAEwecgCRZ4TB5NEGEHnmGII8ugAsC1EJ1xUBNw1iMgCMDCJG2u/1pgAAAABJRU5ErkJggg==' :
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAQBAMAAADdUfNzAAAAJ1BMVEUAAAA4smc4smc4smc4smc4smc4smc4smc4smc4smc4smc4smc4smfNgyS7AAAADHRSTlMAxZgZBuVmZDnkOjj2+7DuAAAANElEQVQI12NQYQCBgwYg8sxsMHmmAEwecgCRZ4TB5NEGEHnmGII8ugAsC1EJ1xUBNw1iMgCMDCJG2u/1pgAAAABJRU5ErkJggg=='


// 画布文本分行
function wrapText(text) {
  const lines = [];
  let testLine = '';
  let prevPoint = 0;
  for (let i = 0; i < text.length; i += 1) {
    testLine += text[i]
    let { width: testWidth } = ctx.measureText(testLine);
    if (testWidth > 830) {
      lines.push(text.substring(prevPoint, i));
      testLine = '';
      prevPoint = i;
      i -= 1;
    }
  }
  if (testLine) {
    lines.push(testLine)
  }

  return lines;
}

// 绘制聊天文字
function drawChatText(ctx, x, y, lines) {
  lines.forEach((line, index) => {
    const drawY = y + chatLineHeight * index;
    ctx.beginPath();
    ctx.font = '28px "PingFangSC-Regular, sans-serif, Arial, SF Pro Display"';
    ctx.fillStyle = '#05110a';
    ctx.textBaseline = 'top';
    ctx.fillText(line, x, drawY);
    ctx.closePath();
  });
}

// 图片填充模式
function aspectFill(w, h, s) {
  if (w / s >= h) {
    return {
      sx: (w - h * s) / 2,
      sy: 0,
      sw: h * s,
      sh: h,
    };
  }
  return {
    sx: 0,
    sy: (h - w / s) / 2,
    sw: w,
    sh: w / s,
  };
}

// 在指定位置绘制图片
function drawImageFill(ctx, img, x, y, w, h) {
  const result = aspectFill(img.width, img.height, w / h);
  ctx.drawImage(img, result.sx, result.sy, result.sw, result.sh, x, y, w, h);
}

// 绘制圆角矩形
function drawRoundRectPath(ctx, width, height, radius) {
  ctx.beginPath(0);
  // 从右下角顺时针绘制，弧度从0到1/2PI
  ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

  // 矩形下边线
  ctx.lineTo(radius, height);

  // 左下角圆弧，弧度从1/2PI到PI
  ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

  // 矩形左边线
  ctx.lineTo(0, radius);

  // 左上角圆弧，弧度从PI到3/2PI
  ctx.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);

  // 上边线
  ctx.lineTo(width - radius, 0);

  // 右上角圆弧
  ctx.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);

  // 右边线
  ctx.lineTo(width, height - radius);
  ctx.closePath();
}

// 绘制带圆角的图片
function drawImageWidthRadios(ctx, img, x, y, w, h, r) {
  if (2 * r > w || 2 * r > h) {
    return false;
  }

  ctx.save();
  ctx.translate(x, y);
  // eslint-disable-next-line no-use-before-define
  drawRoundRectPath(ctx, w, h, r);
  ctx.clip();
  // eslint-disable-next-line no-use-before-define
  drawImageFill(ctx, img, 0, 0, w, h);
  ctx.restore();
}

async function main() {
  const headImage = await loadImage(headUrl);
  const arrowImage = await loadImage(arrowBg);
  // 计算文字总行数
  ctx.font = '28px "PingFangSC-Regular, sans-serif, Arial, SF Pro Display"';
  const lines = wrapText(chatText)
  const [paddingTop, paddingRight, paddingLeft] = bubblePadding
  const canvasHeight = lines.length * chatLineHeight + globalPadding * 2 + paddingTop * 2;
  const { width: lineWidth } = lines.length > 1 ? { width: 830 } : ctx.measureText(lines?.[0] ?? '');
  const canvasWidth = Math.ceil(lineWidth) + globalPadding * 2 + paddingLeft + paddingRight + bubbleRightMargin + headSize;

  // 文本起始位置
  const textStartX = globalPadding + paddingLeft
  const textStartY = globalPadding + paddingTop

  // 气泡大小
  const bubbleWidth = Math.ceil(lineWidth) + paddingLeft + paddingRight - 10;
  const bubbleHeight = lines.length * chatLineHeight + paddingTop * 2;

  // 气泡箭头起始位置
  const arrowY = 24 + globalPadding;
  const arrowX = canvasWidth - globalPadding - headSize - 20;

  // 头像横向位置
  const headX = canvasWidth - globalPadding - headSize;

  // 重设 canvas 大小
  ctx.canvas.width = canvasWidth;
  ctx.canvas.height = canvasHeight;

  // 绘制底色
  ctx.fillStyle = bgColor; 
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // 绘制气泡背景
  ctx.save();
  ctx.translate(globalPadding, globalPadding);
  drawRoundRectPath(ctx, bubbleWidth, bubbleHeight, 8);
  ctx.clip();
  ctx.fillStyle = bubbleBgColor; 
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  ctx.restore();

  // 绘制气泡箭头
  ctx.drawImage(arrowImage, 0, 0, 10, 16, arrowX, arrowY, 10, 16);

  // 绘制头像
  drawImageWidthRadios(ctx, headImage, headX, globalPadding, headSize, headSize, 4);

  // 绘制文字
  drawChatText(ctx, textStartX, textStartY, lines)

  // 保存图片到本地
  fs.writeFileSync(`${projectPath}/output.png`, canvas.toBuffer());
}

main()
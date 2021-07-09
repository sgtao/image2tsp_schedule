'use strict';

function init(){
  let srcImgElement = document.getElementById('imageSrc');
  let inputElement = document.getElementById('fileInput');
  let tmplImgElement = document.getElementById('tempImg');
  let templateElement = document.getElementById('fileTemplate');

  inputElement.addEventListener('change', (e) => {
    srcImgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  srcImgElement.onload = function load_srcImg() {
    let mat = cv.imread(imageSrc);
    cv.imshow('canvasInput', mat);
    mat.delete();
    templateMatching();
  };
  templateElement.addEventListener('change', (e) => {
    tmplImgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  tmplImgElement.onload = function load_templImg() {
    let mat = cv.imread(tempImg);
    cv.imshow('canvasTemplate', mat);
    mat.delete();
    templateMatching();
  };
  function templateMatching() {
    let src = cv.imread('canvasInput');
    let templ = cv.imread('canvasTemplate');
    let src_gray = new cv.Mat();
    let dst = new cv.Mat();
    let mask = new cv.Mat();
    cv.cvtColor(src, src_gray, cv.COLOR_RGBA2GRAY);
    // cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED, mask);
    // let result = cv.minMaxLoc(dst, mask);
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED);
    console.log('dst : ', dst);
    let result = cv.minMaxLoc(dst, mask);
    console.log('result : ', result);
    // let maxPoint = result.maxLoc;
    // let color = new cv.Scalar(255, 0, 0, 255);
    // let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
    // cv.rectangle(src_gray, maxPoint, point, color, 2, cv.LINE_8, 0);
    cv.imshow('canvasOutput', dst);
    src.delete(); dst.delete(); mask.delete();
  }
}
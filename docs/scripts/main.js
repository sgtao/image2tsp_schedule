'use strict';

function init(){
  let inputElement = document.getElementById('fileInput');
  let srcImgElement = document.getElementById('imageSrc');
  let templateElement = document.getElementById('fileTemplate');
  let tmplImgElement = document.getElementById('tempImg');

  inputElement.addEventListener('change', (e) => {
    srcImgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  function load_srcImg() {
    let mat = cv.imread(imageSrc);
    cv.imshow('canvasInput', mat);
    mat.delete();
    templateMatching();
  };
  srcImgElement.addEventListener('load', (event) => {
    load_srcImg(event);
  });

  templateElement.addEventListener('change', (e) => {
    tmplImgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  function load_templImg() {
    let mat = cv.imread(tempImg);
    cv.imshow('canvasTemplate', mat);
    mat.delete();
    templateMatching();
  };
  tmplImgElement.addEventListener('load', (event) => {
    load_templImg(event);
  });

  // 
  function templateMatching() {
    let src = cv.imread('canvasInput');
    let templ = cv.imread('canvasTemplate');
    // let src_gray = new cv.Mat();
    let dst = new cv.Mat();
    let mask = new cv.Mat();
    // cv.cvtColor(src, src_gray, cv.COLOR_RGBA2GRAY);
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED, mask);
    let result = cv.minMaxLoc(dst, mask);
    cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED);
    console.log('dst : ', dst);
    console.log('result : ', result);
    let maxPoint = result.maxLoc;
    let color = new cv.Scalar(255, 0, 0, 255);
    let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
    cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
    cv.imshow('canvasOutput', dst);
    cv.imshow('canvasMatching', src);
    src.delete(); dst.delete(); mask.delete();
  }
  // initial dispatch at loading.
  load_srcImg();
  load_templImg();

}

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

  function canvas_putText(el_Id, x, y, text, font = "20px Arial"){
    let canvasMatching = document.getElementById(el_Id);
    let ctx = canvasMatching.getContext("2d");
    ctx.font = font;
    ctx.fillText(text, x, y);
  }
  function filter_loc_array(res, res_cols, res_rows, maxValue, threshold = 0.95) {
    let loc_array = [];
    let _loc = {'id':0, 'x':0, 'y':0 };
    let _id = 0;
    let filter_val = maxValue > 0 ? maxValue * threshold : 0;
    for (let row = 0; row <= res_rows; row++) {
      for (let col = 0; col <= res_cols; col++) {
        let _loc_val = res[row * res_cols + col];
        if (_loc_val > filter_val) {
          console.log(` ${_id++} : (${col},${row}) = ${_loc_val}`);
        }
    }}
  }


  // 
  function templateMatching() {
    let method = cv.TM_CCORR_NORMED;
    let src = cv.imread('canvasInput', 1);
    let templ = cv.imread('canvasTemplate', 1);
    let mask = new cv.Mat();
    let res_cols = src.cols - templ.cols + 1;
    let res_rows = src.rows - templ.rows + 1;
    let res = new cv.Mat(res_cols, res_rows, cv.CV_32FC1);
    // template matching
    cv.matchTemplate(src, templ, res, method, mask);
    cv.normalize(res, res, 0, 1, cv.NORM_MINMAX, -1, new cv.Mat());

    let minMaxLoc = cv.minMaxLoc(res, mask);
    let matchLoc;
    if (method == cv.TM_SQDIFF || method == cv.TM_SQDIFF_NORMED) {
      matchLoc = minMaxLoc.minLoc;
    } else {
      matchLoc = minMaxLoc.maxLoc;
    }
    console.log('result : ', res);
    console.log('result width, height : ', res.cols, res.rows);
    console.log('minMaxLoc : ', minMaxLoc);
    console.log(`result at maxPoint(${matchLoc.x}, ${matchLoc.y}) = ${res.floatAt(matchLoc.x, matchLoc.y)}`);
    // console.log('result is : ', res.data32F[matchLoc.y * res_cols * matchLoc.x]);
    console.log('result at maxLoc is : ', res.data32F[matchLoc.y * res.cols + matchLoc.x]);

    // 
    // filter
    filter_loc_array(res.data32F, res_cols, res_rows, minMaxLoc.maxVal, 0.99);
    // 
    let color = new cv.Scalar(255, 0, 0, 255);
    let point = new cv.Point(matchLoc.x + templ.cols, matchLoc.y + templ.rows);
    cv.rectangle(src, matchLoc, point, color, 2, cv.LINE_8, 0);
    cv.imshow('canvasOutput', res);
    cv.imshow('canvasMatching', src);
    src.delete(); templ.delete(); res.delete(); mask.delete();
    // put test on canvas --start--
    canvas_putText('canvasMatching', matchLoc.x, matchLoc.y, "1");
    // put test on canvas -- end --
  }
  // initial dispatch at loading.
  load_templImg();
  load_srcImg();

}

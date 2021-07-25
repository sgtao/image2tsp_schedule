'use strict';

function init(){
  let inputElement = document.getElementById('fileInput');
  let srcImgElement = document.getElementById('imageSrc');
  let srcImgElement_sample2 = document.getElementById('imageSrc2');
  let srcImgElement_sample3 = document.getElementById('imageSrc3');
  let sample_list = document.getElementById('sample_list');
  let last_sample = sample_list.value;
  let templateElement = document.getElementById('fileTemplate');
  let tmplImgElement = document.getElementById('tempImg');

  inputElement.addEventListener('change', (e) => {
    srcImgElement.src = URL.createObjectURL(e.target.files[0]);
  }, false);
  function load_srcImg(imageSrc) {
    let mat = cv.imread(imageSrc);
    cv.imshow('canvasInput', mat);
    mat.delete();
    templateMatching();
  };
  srcImgElement.addEventListener('load', (event) => {
    load_srcImg('imageSrc');
  });
  sample_list.addEventListener('change', () => {
    let choose_sample = sample_list.value;
    if (choose_sample != last_sample) {
      last_sample = choose_sample;
      // about above, more improve needed
      switch(choose_sample) {
        case '01a_pt76_map' : 
          load_srcImg('imageSrc');
          load_sample_result('assets/results/01a_pt76_map.cyc');
          break;
        case '02a_USA_cities_map' :
          load_srcImg('imageSrc2'); 
          load_sample_result('assets/reulsts/02a_USA_cities_map.cyc');
          break;
        case '03a_wi29_map' :
          load_srcImg('imageSrc3'); 
          load_sample_result('assets/reulsts/03a_wi29_map.cyc');
          break;
        default : 
          load_srcImg('imageSrc'); break;
      }
    }
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
  // putText on canvas by id name
  function canvas_putText(el_Id, x, y, text, font = "20px Arial"){
    let canvasMatching = document.getElementById(el_Id);
    let ctx = canvasMatching.getContext("2d");
    ctx.font = font;
    ctx.fillText(text, x, y);
  }
  // find locations over threshold from result array 
  function loc_val(x, y, val = 1) {
    this.x = x;
    this.y = y;
    this.val = val;
  }
  function find_loc_array(res, res_cols, res_rows, maxValue, threshold = 0.95) {
    let loc_array = new Array();
    let _id = 0;
    let filter_val = maxValue > 0 ? maxValue * threshold : 0;
    let filter_sign = maxValue > 0 ? 1 : -1;
    for (let row = 0; row <= res_rows; row++) {
      for (let col = 0; col <= res_cols; col++) {
        let _loc_val = res[row * res_cols + col];
        if (_loc_val > (filter_sign * filter_val)) {
          // console.log(` ${_id++} : (${col},${row}) = ${_loc_val}`);
          loc_array.push(new loc_val(col, row, _loc_val));
        }
    }}
    return loc_array;
  }
  // 
  // multiple templateMatching 
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
    // console.log('minMaxLoc : ', minMaxLoc);
    // console.log(`result at maxPoint(${matchLoc.x}, ${matchLoc.y}) = ${res.floatAt(matchLoc.x, matchLoc.y)}`);
    // console.log('result at maxLoc is : ', res.data32F[matchLoc.y * res.cols + matchLoc.x]);
    // find locations over threshold
    let loc_array = find_loc_array(res.data32F, res_cols, res_rows, minMaxLoc.maxVal, 0.99);
    console.log(loc_array);
    // 
    // output matching result
    let output = new cv.Mat();
    src.copyTo(output);
    let color = new cv.Scalar(255, 0, 0, 255);
    // append matching locations
    for (let i = 0; i < loc_array.length; i++ ) {
      let point_base = { x: loc_array[i].x, y: loc_array[i].y};
      // console.log(i, point_base);
      let point = new cv.Point(point_base.x + templ.cols, point_base.y + templ.rows);
      cv.rectangle(output, point_base, point, color, 2, cv.LINE_8, 0);
    }
    // cv.imshow('canvasOutput', res);
    cv.imshow('canvasMatching', output);
    src.delete(); templ.delete(); res.delete(); mask.delete(); output.delete();
    // put test on canvas --start--
    for (let i = 0; i < loc_array.length; i++) {
      canvas_putText('canvasMatching', loc_array[i].x, loc_array[i].y, i + 1);
    }
    // put test on canvas -- end --
    // 
    // 座標リストを表示
    show_matching_list('MatchingList', loc_array);

  }
  // Matching coordinates list
  function show_matching_list (el_Id, loc_array) {
    let showarea = document.getElementById(el_Id);
    if (loc_array.length === 0) { return; }
    //新たな子要素の生成
    let comment_div = document.createElement('div');
    comment_div.textContent = 'matching : ' + loc_array.length + 'point(s)'
    let new_ul = document.createElement('ul');
    for (let i = 0; i < loc_array.length; i++) {
      let new_li = document.createElement('li');
      new_li.textContent = (i+1) + ' : x = ' + loc_array[i].x + ', y = ' + loc_array[i].y ;
      new_ul.appendChild(new_li);
    }
    //もとの子要素を全て削除
    while (showarea.firstChild) showarea.removeChild(showarea.firstChild);
    //新たな子要素を追加
    showarea.appendChild(comment_div);
    showarea.appendChild(new_ul);
  }
  // load sample result(temporary)
  function load_sample_result(filepath) {
    console.log('loading ', filepath);
    // use fetch to retrieve the companies and pass them to init
    // report any errors that occur in the fetch operation
    // once the products have been successfully loaded and formatted as a JSON object
    // using response.json(), run the initialize() function
    fetch(filepath).then(function (response) {
      return response.text();
    }).then(function (text_result) {
      show_tour_result(text_result);
    }).catch(function (err) {
      console.log('Fetch problem: ' + err.message);
    });
  }
  // show tour result
  function show_tour_result(text_result) {
    let _text_result_array = text_result.split('\n');
    console.log(_text_result_array);
  }
  // initial dispatch at loading.
  load_templImg();
  load_srcImg('imageSrc');
  load_sample_result('assets/results/01a_pt76_map.cyc');
}

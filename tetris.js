"use strict"

const tet_canvas = document.getElementById("tetris_canvas");
const tet_ctx = tet_canvas.getContext("2d");

const DAS_button = document.getElementById("DAS_button");

let tet_tiles = Array(30)
.fill()
.map(() => Array(10).fill(0));

let put_tiles = Array(30)
  .fill()
  .map(() => Array(10).fill(0));

let mino_x;
let mino_y;
let next_mino = [];
let hold_mino = 0;
let rotate_num;
let can_left_DAS_count = false;
let left_DAS_count = 0;
let can_right_DAS_count = false;
let right_DAS_count = 0;
let save_tet_mino = [];  // 一つ目x, y, 二つ目x, y ....
let can_drop = true;
let can_hold = true;
let left_or_right = null;

const mino_color = [
    "#9933FF", // T
    "#00CCFF", // I
    "#00FF00", // S
    "#FF0000", // Z
    "#FF9900", // L
    "#3333FF", // J
    "#FFFF00", // O
];

let keyup = [0, 0, 0, 0]

let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    z: false,
    x: false,
    c: false,
    r: false
};

let move_setting = {
    DAS: 7
}

let mino_style = [
    0,-1,0,1,-1,0,0,0,0,-1,0,0,-1,0,0,1,-1,0,1,0,0,0,0,1,0,0,1,0,-1,0,0,1, // T
    -1,0,1,2,0,0,0,0,0,0,0,0,-1,0,1,2,-1,0,1,2,1,1,1,1,1,1,1,1,-1,0,1,2, //I
    1,0,0,-1,-1,-1,0,0,-1,0,-1,0,-1,0,0,1,1,0,0,-1,0,0,1,1,0,1,0,1,-1,0,0,1, //S
   -1,0,0,1,-1,-1,0,0,0,-1,0,-1,-1,0,0,1,-1,0,0,1,0,0,1,1,1,0,1,0,-1,0,0,1,//Z
    1,-1,0,1,-1,0,0,0,-1,0,0,0,-1,-1,0,1,-1,0,1,-1,0,0,0,1,0,0,0,1,-1,0,1,1, //L
    -1,-1,0,1,-1,0,0,0,0,0,-1,0,-1,0,1,1,-1,0,1,1,0,0,0,1,0,1,0,0,-1,-1,0,1, //J
    0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0 //O
  ];
  
  let rotate_style = [
    [0, 0, -1, 0, -1, 1, 0, -2, -1, -2], //0->R
    [0, 0, 1, 0, 1, -1, 0, 2, 1, 2], //R->0
    [0, 0, 1, 0, 1, -1, 0, 2, 1, 2], //R->2
    [0, 0, -1, 0, -1, 1, 0, -2, -1, -2], //2->R
    [0, 0, 1, 0, 1, 1, 0, -2, 1, -2], //2->L
    [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->2
    [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->0
    [0, 0, 1, 0, 1, 1, 0, -2, 1, -2], //0->L
  ];
  
  // Iミノ用SRS
  let i_rotate_style = [
    [0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //0->R
    [0, 0, 2, 0, -1, 0, 2, 1, -1, -2], //R->0
    [0, 0, -1, 0, 2, 0, -1, 2, 2, -1], //R->2
    [0, 0, 1, 0, -2, 0, 1, -2, -2, 1], //2->R
    [0, 0, 2, 0, -1, 0, 2, 1, -1, -2], //2->L
    [0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //L->2
    [0, 0, 1, 0, -2, 0, 1, -2, -2, 1], //L->0
    [0, 0, -1, 0, 2, 0, -1, 2, 2, -1], //0->L
  ];

// キー処理
document.addEventListener("keydown", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        if (e.key === "ArrowLeft") left_or_right = "left";
        if (e.key === "ArrowRight") left_or_right = "right";
    }
})

document.addEventListener("keyup", (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        if (e.key === "ArrowUp") keyup[0] = 0;
        if (e.key === "z") keyup[1] = 0;
        if (e.key === "x") keyup[2] = 0;
        if (e.key === "c") keyup[3] = 0;
        if (e.key === "ArrowLeft") {
          can_left_DAS_count = false;
          left_DAS_count = 0;
          left_or_right = "right";
        }
        if (e.key === "ArrowRight") {
          can_right_DAS_count = false;
          right_DAS_count = 0;
          left_or_right = "left";
        }
    }
})

DAS_button.onclick = () => {
  const setting_DAS = document.getElementById("setting_DAS").value;
  move_setting.DAS = Number(setting_DAS)
}

// ミノ初期化
function new_mino () {
    mino_x = 4;
    mino_y = 10;
    rotate_num = 0;
    if (next_mino.length < 7) {
        next_mino.push(...create_next());
    }
    set_mino();
}

// ネクスト作成
function create_next() {
    const mino_types = [1, 2, 3, 4, 5, 6, 7]; //T, I, S, Z, L, J, O
    for (let i = mino_types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mino_types[i], mino_types[j]] = [mino_types[j], mino_types[i]]; // 要素を交換
    }
    return mino_types;
}

//描画関係
function draw_canvas () {
  tet_ctx.clearRect(0, 0, tet_canvas.width, tet_canvas.height);

  //ライン描画
  tet_ctx.strokeStyle = "gray";
  tet_ctx.lineWidth = 1;

  //メイン
  for (let y = 0; y < 21; y++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(100, y * 30 + 300); //始点x,y
    tet_ctx.lineTo(400, y * 30 + 300); //終点x,y
    tet_ctx.stroke();
  }

  for (let x = 0; x < 11; x++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(x * 30 + 100, 300); //始点x,y
    tet_ctx.lineTo(x * 30 + 100, 900); //終点x,y
    tet_ctx.stroke();
  }

  //Hold
  for (let i = 0; i < 2; i++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(0, i * 100 + 300); //始点x,y
    tet_ctx.lineTo(100, i * 100 + 300); //終点x,y
    tet_ctx.stroke();
    tet_ctx.beginPath();
    tet_ctx.moveTo(i * 100, 300); //始点x,y
    tet_ctx.lineTo(i * 100, 400); //終点x,y
    tet_ctx.stroke();
  }

  //Next
  for (let i = 0; i < 2; i++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(400, i * 400 + 300); //始点x,y
    tet_ctx.lineTo(500, i * 400 + 300); //終点x,y
    tet_ctx.stroke();
    tet_ctx.beginPath();
    tet_ctx.moveTo(i + 5 * 100, 300); //始点x,y
    tet_ctx.lineTo(i + 5 * 100, 700); //終点x,y
    tet_ctx.stroke();
  }

    // 譜面描画
    for (let y = 0; y < tet_tiles.length; y++) {
        for (let x = 0; x < tet_tiles[y].length; x++) {
            if (tet_tiles[y][x] !== 0) {
                tet_ctx.fillStyle = mino_color[tet_tiles[y][x] - 1];
                tet_ctx.fillRect(x * 30 + 100, y * 30, 30, 30);
            }
            if (put_tiles[y][x] !== 0) {
              tet_ctx.fillStyle = mino_color[put_tiles[y][x] - 1];
              tet_ctx.fillRect(x * 30 + 100, y * 30, 30, 30);
            }
        }
    }

    draw_ghost_mino();

    // ネクスト描画
    if (next_mino.length > 0) {
        for (let i = 0; i < Math.min(5, next_mino.length - 1); i++) {
          if (next_mino[i + 1]) {
            tet_ctx.fillStyle = mino_color[next_mino[i + 1] - 1];
            for (let d = 0; d < 4; d++) {
              if (next_mino[i + 1] === 2 || next_mino[i + 1] === 7) {
                tet_ctx.fillRect(
                  mino_style[(next_mino[i + 1] - 1) * 32 + d] * 20 + 430,
                  mino_style[(next_mino[i + 1] - 1) * 32 + d + 4] * 20 +
                    340 +
                    i * 80,
                  20,
                  20
                );
              } else {
                tet_ctx.fillRect(
                  mino_style[(next_mino[i + 1] - 1) * 32 + d] * 20 + 440,
                  mino_style[(next_mino[i + 1] - 1) * 32 + d + 4] * 20 +
                    340 +
                    i * 80,
                  20,
                  20
                );
              }
            }
          }
        }
    }

    // ホールド
    if (hold_mino !== 0) {
        tet_ctx.fillStyle = mino_color[hold_mino - 1];
        for (let i = 0; i < 4; i++) {
          if (hold_mino === 2 || hold_mino === 7) {
            tet_ctx.fillRect(
              mino_style[(hold_mino - 1) * 32 + i] * 20 + 30,
              mino_style[(hold_mino - 1) * 32 + i + 4] * 20 + 345,
              20,
              20
            );
          } else {
            tet_ctx.fillRect(
              mino_style[(hold_mino - 1) * 32 + i] * 20 + 40,
              mino_style[(hold_mino - 1) * 32 + i + 4] * 20 + 345,
              20,
              20
            );
          }
        }
    }
}

// 影描画
function draw_ghost_mino() {
  let ghost_y = mino_y;

  // 下に落とせる限界まで落とす
  while (true) {
      let can_move = true;
      for (let i = 0; i < 4; i++) {
          const x = mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i];
          const y = ghost_y + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i];
          if (y >= 30 || put_tiles[y][x] !== 0) {
              can_move = false;
              break;
          }
      }
      if (!can_move) break;
      ghost_y++;
  }

  // ミノ描画（透明な色で影として表示）
  tet_ctx.fillStyle = mino_color[next_mino[0] - 1] + "60"; // 透明度 40%
  for (let i = 0; i < 4; i++) {
      const x = mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i];
      const y = ghost_y - 1 + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i];
      tet_ctx.fillRect(x * 30 + 100, y * 30, 30, 30);
  }
}

// ミノ整形
function set_mino () {
  save_tet_mino = [];
    for (let i = 0; i < 4; i++) {
        tet_tiles[mino_y + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i]][mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i]] = next_mino[0];
        save_tet_mino[2 * i] = mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i];
        save_tet_mino[2 * i + 1] = mino_y + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i]
    }
}

function delete_before_mino () {
  for (let i = 0; i < 4; i++) {
    tet_tiles[save_tet_mino[2 * i + 1]][save_tet_mino[2 * i]] = 0;
  }
}

// 移動処理
function move () {
  // 左移動
  if (keys.ArrowLeft && left_or_right === "left") {
    if (left_DAS_count === 0 || left_DAS_count > move_setting.DAS) {
      let can_move = 0;
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i * 2] > 0 && 
            put_tiles[save_tet_mino[i * 2 + 1]][save_tet_mino[i * 2] - 1] === 0) {
          can_move++;
        }
      }
      if (can_move === 4) {
        mino_x--;
        can_left_DAS_count = true;
        delete_before_mino();
        set_mino();
      }
    }
  }
  
  // 右移動
  if (keys.ArrowRight && left_or_right === "right") {
    if (right_DAS_count === 0 || right_DAS_count > move_setting.DAS) {
      let can_move = 0;
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i * 2] < 9 && 
            put_tiles[save_tet_mino[i * 2 + 1]][save_tet_mino[i * 2] + 1] === 0) {
          can_move++;
        }
      }
      if (can_move === 4) {
        mino_x++;
        can_right_DAS_count = true;
        delete_before_mino();
        set_mino();
      }
    }
  }
  
  // 下移動
  if (keys.ArrowDown) {
    let can_move = 0;
    for (let i = 0; i < 4; i++) {
      if (save_tet_mino[i * 2 + 1] < 29 && 
          put_tiles[save_tet_mino[i * 2 + 1] + 1][save_tet_mino[i * 2]] === 0) {
        can_move++;
      }
    }
    if (can_move === 4) {
      mino_y++;
      delete_before_mino();
      set_mino();
    }
  }
}

// ハードドロップ
function hard_drop () {
  if (keys.ArrowUp && keyup[0] == 0) {
    while (can_drop) {
      let can_move = 0;
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i * 2 + 1] < 29 && put_tiles[save_tet_mino[i * 2 + 1] + 1][save_tet_mino[i * 2]] === 0) {
          can_move++;
        }
      }
      if (can_move === 4) {
        mino_y++;
        delete_before_mino()
        set_mino();
      } else {
        can_drop = false;
        for (let i = 0; i < 4; i++) {
          put_tiles[save_tet_mino[2 * i + 1]][save_tet_mino[2 * i]] = next_mino[0];
        }
        next_mino.shift();
        new_mino();
      }
    }
    can_hold = true;
    can_drop = true;
    keyup[0] = 1;
  }
}

// ホールド
function hold () {
  if (keys.c && keyup[3] === 0 && can_hold) {
    if (hold_mino !== 0) {
      const save_next_mino = next_mino[0];
      next_mino[0] = hold_mino;
      hold_mino = save_next_mino;
    } else {
      hold_mino = next_mino[0];
      next_mino.shift();
    }
    keyup[3] = 1;
    can_hold = false;
    delete_before_mino()
    new_mino()
  }
}

// SRSの場所
function serch_rotate_plase (save_rotate_num, rotate_num) {
  let rotate_plase
  switch (`${save_rotate_num}${rotate_num}`) {
    case "03":
      rotate_plase = 0;
      break;
    case "30":
      rotate_plase = 1;
      break;
    case "32":
      rotate_plase = 2;
      break;
    case "23":
      rotate_plase = 3;
      break;
    case "21":
      rotate_plase = 4;
      break;
    case "12":
      rotate_plase = 5;
      break;
    case "10":
      rotate_plase = 6;
      break;
    case "01":
      rotate_plase = 7;
      break;
  }
return rotate_plase;
}

function delete_line () {
  for (let i = 0; i < 30; i++) {
    let count_tile = 0;
    for (let x = 0; x < 10; x++) {
      if (put_tiles[i][x] !== 0) {
        count_tile++;
      }
    }
    if (count_tile === 10) {
      put_tiles.splice(i, 1);
      put_tiles.unshift(Array(10).fill(0));
      for (let yy = 0; yy < 30; yy++) {
        for (let xx = 0; xx < 10; xx++) {
          tet_tiles[yy][xx] = put_tiles[yy][xx];
        }
      }
    }
  }
  set_mino();
}

// ミノ回転
function rotate () {
  if (keys.z && keyup[1] === 0) {
    if (next_mino[0] === 7) {
      keyup[1] = 1;
      return;
    }

    let save_rotate_num = rotate_num;
    if (rotate_num === 3) {
      rotate_num = 0;
    } else {
      rotate_num++;
    }

    const rotate_plase = serch_rotate_plase(save_rotate_num, rotate_num);
    const save_mino_x = mino_x;
    const save_mino_y = mino_y;
    const current_rotate_style = next_mino[0] === 2 ? i_rotate_style : rotate_style;
    
    delete_before_mino();
    
    let success = false;
    for (let can_rotate_num = 0; can_rotate_num < 5; can_rotate_num++) {
      let can_move_rotate = 0;
      mino_x = save_mino_x + current_rotate_style[rotate_plase][can_rotate_num * 2];
      mino_y = save_mino_y + -1 * current_rotate_style[rotate_plase][can_rotate_num * 2 + 1];

      let valid_position = true;
      for (let i = 0; i < 4; i++) {
        const check_x = mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i];
        const check_y = mino_y + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i];
        
        if (check_x < 0 || check_x > 9 || check_y < 0 || check_y > 29) {
          valid_position = false;
          break;
        }
      }
      
      if (!valid_position) {
        continue;
      }

      set_mino();

      for (let i = 0; i < 4; i++) {
        const check_x = save_tet_mino[i * 2];
        const check_y = save_tet_mino[i * 2 + 1];
        
        if (put_tiles[check_y][check_x] === 0) {
          can_move_rotate++;
        }
      }

      if (can_move_rotate === 4) {
        success = true;
        break;
      } else {
        delete_before_mino();
      }
    }
    
    if (!success) {
      rotate_num = save_rotate_num;
      mino_x = save_mino_x;
      mino_y = save_mino_y;
      set_mino();
    }
    
    keyup[1] = 1;
  }
  
  if (keys.x && keyup[2] === 0) {
    if (next_mino[0] === 7) {
      keyup[2] = 1;
      return;
    }

    let save_rotate_num = rotate_num;
    if (rotate_num === 0) {
      rotate_num = 3;
    } else {
      rotate_num--;
    }

    const rotate_plase = serch_rotate_plase(save_rotate_num, rotate_num);
    const save_mino_x = mino_x;
    const save_mino_y = mino_y;
    const current_rotate_style = next_mino[0] === 2 ? i_rotate_style : rotate_style;
    
    delete_before_mino();
    
    let success = false;
    for (let can_rotate_num = 0; can_rotate_num < 5; can_rotate_num++) {
      let can_move_rotate = 0;
      mino_x = save_mino_x + current_rotate_style[rotate_plase][can_rotate_num * 2];
      mino_y = save_mino_y + -1 * current_rotate_style[rotate_plase][can_rotate_num * 2 + 1];

      let valid_position = true;
      for (let i = 0; i < 4; i++) {
        const check_x = mino_x + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + i];
        const check_y = mino_y + mino_style[(next_mino[0] - 1) * 32 + rotate_num * 8 + 4 + i];
        
        if (check_x < 0 || check_x > 9 || check_y < 0 || check_y > 29) {
          valid_position = false;
          break;
        }
      }
      
      if (!valid_position) {
        continue;
      }

      set_mino();

      for (let i = 0; i < 4; i++) {
        const check_x = save_tet_mino[i * 2];
        const check_y = save_tet_mino[i * 2 + 1];
        
        if (put_tiles[check_y][check_x] === 0) {
          can_move_rotate++;
        }
      }

      if (can_move_rotate === 4) {
        success = true;
        break;
      } else {
        delete_before_mino();
      }
    }
    
    if (!success) {
      rotate_num = save_rotate_num;
      mino_x = save_mino_x;
      mino_y = save_mino_y;
      set_mino();
    }
    
    keyup[2] = 1;
  }
}

new_mino();
set_mino();

setInterval(() => {
    if (can_left_DAS_count) left_DAS_count++;
    if (can_right_DAS_count) right_DAS_count++;
    delete_line();
    hold();
    move();
    hard_drop();
    rotate();
    draw_canvas();
}, 16)
// 衝突判定クラス
module.exports = class OverlapTester {
  static overlapRects(rect1, rect2) {
    // 矩形１の左端と矩形２の右端を比べて、矩形１の左端の方が右にあるなら、重ならない。
    if (rect1.fLeft > rect2.fRight) {
      return false;
    }
    // 矩形１の右端と矩形２の左端を比べて、矩形１の右端の方が左にあるなら、重ならない。
    if (rect1.fRight < rect2.fLeft) {
      return false;
    }
    // 矩形１の下端と矩形２の上端を比べて、矩形１の下端の方が上にあるなら、重ならない。
    if (rect1.fBottom > rect2.fTop) {
      return false;
    }
    // 矩形１の上端と矩形２の下端を比べて、矩形１の上端の方が下にあるなら、重ならない。
    if (rect1.fTop < rect2.fBottom) {
      return false;
    }
    // 上記以外は重なる。
    return true;
  }

  static landOnRects(rect1, rect2) {
    // 矩形１（=ボール）が矩形２（=床）よりも上にある状態で重なっていれば、踏んでいる可能性あり。
    // ？？？なぜか条件式を逆にするとうまくいく。Canvas の正が下向きな事と関係している気がするが、保留。
    if (rect2.fBottom >= rect1.fBottom) {
      return true;
    }
    // 上記以外は踏んでいないとみなす。
    return false;
  }

  static pointInRect(rect, point) {
    return (
      rect.fLeft <= point.fX &&
      rect.fRight >= point.fX &&
      rect.fBottom <= point.fY &&
      rect.fTop >= point.fY
    );
  }

  static touchDirInRect(rect, point) {
    // 左端に衝突
    if (rect.fLeft > point.fX) {
      return 'left';
    }
    // 右端に衝突
    if (rect.fRight < point.fX) {
      return 'right';
    }
    // 下端に衝突
    if (rect.fBottom > point.fY) {
      return 'bottom';
    }
    // 上端に衝突
    if (rect.fTop < point.fY) {
      return 'top';
    }
    return 'noTouch';
  }
};

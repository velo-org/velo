function swap<V = any>(items: V[], leftIndex: number, rightIndex: number) {
  var temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
}
function partition<V = any>(items: (V | any)[], left: number, right: number) {
  var pivot = items[Math.floor((right + left) / 2)], //middle element
    i = left, //left pointer
    j = right; //right pointer
  while (i <= j) {
    while (items[i].accessed < pivot) {
      i++;
    }
    while (items[j].accessed > pivot) {
      j--;
    }
    if (i <= j) {
      swap(items, i, j); //sawpping two elements
      i++;
      j--;
    }
  }
  return i;
}

export function quickSort<V = any>(items: V[], left: number, right: number) {
  var index;
  if (items.length > 1) {
    index = partition<any>(items, left, right); //index returned from partition
    if (left < index - 1) {
      //more elements on the left side of the pivot
      quickSort<any>(items, left, index - 1);
    }
    if (index < right) {
      //more elements on the right side of the pivot
      quickSort<any>(items, index, right);
    }
  }
  return items;
}

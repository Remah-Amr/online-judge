var inputString = '';
var currentLine = 0;

process.stdin.on('data', function (inputStdin) {
  inputString += inputStdin;
});

process.stdin.on('end', function (_) {
  inputString = inputString
    .trim()
    .split('\n')
    .map(function (string) {
      return string.trim();
    });

  main();
});

function readLine() {
  return inputString[currentLine++];
}

function getArea(length, width) {
  var area;
  area = length * width;

  return area;
}

function getPerimeter(length, width) {
  var perimeter;
  // Write your code here
  perimeter = 2 * (length + width);

  return perimeter;
}

function main() {
  const length = +readLine();
  const width = +readLine();

  console.log(getArea(length, width));
  console.log(getPerimeter(length, width));
}

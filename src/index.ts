
const countElement = document.querySelector<HTMLSpanElement>('#count')!;

const currentCount = () => Number(countElement.textContent);
const updateCount = (count: number) =>
  (countElement.textContent = count.toString())

document.querySelector<HTMLButtonElement>('#increment')!.addEventListener('click', () => {
  updateCount(currentCount() + 1);
});

document.querySelector<HTMLButtonElement>('#decrement')!.addEventListener('click', () => {
  updateCount(currentCount() - 1);
});

document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', () => {
  updateCount(0);
});
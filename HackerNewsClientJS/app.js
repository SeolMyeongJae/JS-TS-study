// XMLHttpRequest 서버에 데이터 요청
const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';

// 해커뉴스 데이터 요청, false는 동기적으로 처리하하는 옵션
ajax.open('GET', NEWS_URL, false);

// send 함수를 호출하면 데이터를 가져옴
ajax.send();

// 데이터는 response에 저장
// console.log(ajax.response);

// JSON 데이터를 객체로 변환
const newsFeed = JSON.parse(ajax.response);
// console.log(newsFeed);

// 데이터를 화면에 보여줄 ul 태그 생성
const ul = document.createElement('ul');

// 보여줄 데이터를 ul 태그의 자식으로 li 추가
for (let i = 0; i < 10; i++) {
  const li = document.createElement('li');
  li.innerHTML = newsFeed[i].title;
  ul.appendChild(li);
}

// root 태그의 자식으로 ul 추가
document.getElementById('root').appendChild(ul);

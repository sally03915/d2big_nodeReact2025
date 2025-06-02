import cron from "node-cron";

cron.schedule('* * * * *', () => {
  console.log('이 작업은 매 분마다 실행');
}, {
  scheduled: true, // 기본값은 true (자동 실행)
  timezone: "Asia/Seoul" // 한국 시간대 설정
});


// 수동으로 시작시
/*
const task = cron.schedule('* * * * *', () => {
  console.log('이 작업은 매 분마다 실행됩니다.');
}, { scheduled: false });

task.start(); // 작업 시작
task.stop();  // 작업 중지
*/

/*
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ 요일 (0-7, 0과 7은 일요일)
│ │ │ │ └── 월 (1-12)
│ │ │ └─── 일 (1-31)
│ │ └──── 시 (0-23)
│ └───── 분 (0-59)
└────── 초 (선택 사항, 기본적으로 생략 가능)

*/
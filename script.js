let currentDate = new Date();
let selectedDate = null;
let selectedHours = [];
let selectedCourts = [];

function renderCalendar(){

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthYear").innerText =
    currentDate.toLocaleString('default',{
      month:'long',
      year:'numeric'
    });

  const calendarDays =
    document.getElementById("calendarDays");

  calendarDays.innerHTML = "";

  const firstDay =
    new Date(year,month,1).getDay();

  const daysInMonth =
    new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){

    const blank = document.createElement("div");

    calendarDays.appendChild(blank);

  }

  for(let day=1;day<=daysInMonth;day++){

    const div = document.createElement("div");

    div.classList.add("day");

    div.innerText = day;

    const today = new Date();

    if(
      day===today.getDate()
      &&
      month===today.getMonth()
      &&
      year===today.getFullYear()
    ){
      div.classList.add("today");
    }

    div.onclick = function(){

      document.querySelectorAll(".day")
        .forEach(d=>d.classList.remove("selected-day"));

      div.classList.add("selected-day");

        // STORE SELECTED DATE
      selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

      updateSelectedDisplay();
    };

    calendarDays.appendChild(div);

  }

}


function updateSelectedDisplay(){

  const courtEl =
    document.getElementById("selectedCourt");

  const timeEl =
    document.getElementById("selectedTime");

  const dateEl =
    document.getElementById("selectedDate");

  if(!dateEl) return;

  if(selectedDate){
    const formatted =
      selectedDate.toLocaleDateString('en-US',{
        weekday:'short',
        year:'numeric',
        month:'short',
        day:'numeric'
      });

    dateEl.innerText = "Date: " + formatted;
  }

}



function repaintGrid(){

  document
    .querySelectorAll(".slot")
    .forEach(cell=>{

      const hour =
        parseInt(cell.dataset.hour);

      const court =
        cell.dataset.court;

      if(
        selectedHours.includes(hour)
        &&
        selectedCourts.includes(court)
      ){

        cell.classList.add("selected");

      }
      else{

        cell.classList.remove("selected");

      }

    });

}



function updateSummary(){

  if(
    selectedHours.length===0
  ){

    document.getElementById(
      "selectedCourt"
    ).innerText =
      "Court:";

    document.getElementById(
      "selectedTime"
    ).innerText =
      "Time:";

    return;

  }


  const sortedHours =
    [...selectedHours]
    .sort((a,b)=>a-b);

  const firstHour =
    sortedHours[0];

  const lastHour =
    sortedHours[
      sortedHours.length-1
    ];

  document
    .getElementById(
      "selectedCourt"
    )
    .innerText =
    "Court: "
    +
    selectedCourts.join(", ");

  document
    .getElementById(
      "selectedTime"
    )
    .innerText =
    "Time: "
    +
    formatHour(firstHour)
    +
    " to "
    +
    formatHour(lastHour);

  updateSelectedDisplay();

}



function formatHour(hour){

  const start = hour % 12 || 12;
  const startPeriod = hour < 12 ? "AM" : "PM";

  const endHour = (hour + 1) % 24;
  const end = endHour % 12 || 12;
  const endPeriod = endHour < 12 ? "AM" : "PM";

  return `${start}${startPeriod} - ${end}${endPeriod}`;
}


function generateGrid(){

  const grid =
    document.getElementById("scheduleGrid");

  grid.innerHTML = "";

  const courts = ["Court 1", "Court 2", "Court 3"];

  for(let hour = 7; hour <= 25; hour++){

    const row =
      document.createElement("div");

    row.classList.add("schedule-row");

    // TIME LABEL
    const time =
      document.createElement("div");

    time.classList.add("time-label");

    time.innerText =
      formatHour(hour);

    row.appendChild(time);

    // COURT CELLS
    courts.forEach(court => {

      const cell =
        document.createElement("div");

      cell.classList.add("slot");

      cell.dataset.court = court;
      cell.dataset.time = formatHour(hour);
      cell.dataset.hour = hour;

      cell.addEventListener("click", () => {
      
        const hour =
          parseInt(cell.dataset.hour);
      
        const court =
          cell.dataset.court;
      
        if(!selectedHours.includes(hour)){
      
          selectedHours.push(hour);
      
        }
      
        if(!selectedCourts.includes(court)){
      
          selectedCourts.push(court);
      
        }
      
        repaintGrid();
      
        updateSummary();
      
      });

      row.appendChild(cell);

    });

    grid.appendChild(row);
  }
}


document.getElementById("prevMonth")
.onclick = function(){

  currentDate.setMonth(
    currentDate.getMonth()-1
  );

  renderCalendar();

};

document.getElementById("nextMonth")
.onclick = function(){

  currentDate.setMonth(
    currentDate.getMonth()+1
  );

  renderCalendar();

};

renderCalendar();
generateGrid();

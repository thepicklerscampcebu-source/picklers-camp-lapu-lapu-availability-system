let currentDate = new Date();
let selectedDate = null;

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


function updateSelectionSummary(){

  if(selectedSlots.length === 0){

    document.getElementById("selectedCourt")
      .innerText = "Court:";

    document.getElementById("selectedTime")
      .innerText = "Time:";

    return;

  }

  const sortedSlots =
    [...selectedSlots].sort(
      (a,b)=>
        parseInt(a.dataset.hour) -
        parseInt(b.dataset.hour)
    );

  const first = sortedSlots[0];
  const last =
    sortedSlots[sortedSlots.length-1];

  document.getElementById("selectedCourt")
    .innerText =
    "Court: " + first.dataset.court;

  document.getElementById("selectedTime")
    .innerText =
    "Time: " +
    formatHour(parseInt(first.dataset.hour))
    +
    " to "
    +
    formatHour(parseInt(last.dataset.hour));

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

  let selectedSlots = [];

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
      
        if(selectedSlots.includes(cell)){
      
          cell.classList.remove("selected");
      
          selectedSlots =
            selectedSlots.filter(slot => slot !== cell);
      
        }
        else{
      
          cell.classList.add("selected");
      
          selectedSlots.push(cell);
      
        }
      
        updateSelectionSummary();
      
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

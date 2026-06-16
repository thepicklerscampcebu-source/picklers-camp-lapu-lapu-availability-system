let selectedCell = null;

document.querySelectorAll(".available")
.forEach(cell=>{

  cell.addEventListener("click", ()=>{

    if(selectedCell){
      selectedCell.classList.remove("selected");
    }

    cell.classList.add("selected");

    selectedCell = cell;

    document.getElementById("selectedCourt")
      .innerText =
      "Court: " + cell.dataset.court;

    document.getElementById("selectedTime")
      .innerText =
      "Time: " + cell.dataset.time;

  });

});


let currentDate = new Date();

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

    };

    calendarDays.appendChild(div);

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

<script>

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

</script>

//Initialize values:

const POFs = [
  {
      "probability": 0.1,
      "DBI": 1.08,
      "dash": 'dash'
  },
  {
      "probability": 0.25,
      "DBI": 1.38,
      "dash": 'dashdot'
  },
  {
      "probability": 0.5,
      "DBI": 2.07,
      "dash": 'solid'
  },
  {
      "probability": 0.75,
      "DBI": 3.1,
      "dash": 'dashdot'
  },
  {
      "probability": 0.9,
      "DBI": 3.95,
      "dash": 'dash'
  }
]

//set up form and add event listener for calculate button to update output and graph
const form = document.getElementById('calculatorInput')
form.addEventListener('submit', e => {
  e.preventDefault()
  update()
})

//set up x values for graph lines
const xValues = []
for(let i = 4; i < 12; i++){
  let step = Math.pow(10, -1+i)
  for(let j = 0; j < 9; j++){
    const value = (step+(j*step)).toFixed(1)
    xValues.push(value)
  }
}

//add event listener to inputs to enable submit button
const inputs = document.querySelectorAll('input')
inputs.forEach(input => {
  input.addEventListener('input', e => {
    enableSubmit()
  })
})


//hide alert
hideFormAlert()

//initially update the output and graph accordingly
updateGraph()

//Functions:

//enable submit button if all fields are filled
function enableSubmit() {
  const submitButton = document.getElementById('submitButton')
  const inputs = getFormData()
  let allFilled = true
  Object.keys(inputs).forEach(input => {
    if(inputs[input] === '') {
      allFilled = false
    }
  })
  if(allFilled) {
    submitButton.disabled = false
  } else {
    submitButton.disabled = true
  }
}

//function to calculate the DBI from form input
function calculateDBI(formData) {
  const area = formData.area
  const vOverH = (formData.volume / formData.height)
  //determine whether to show warning
  
  if (area < 100000 || area > 10000000000 || vOverH < 10 || vOverH > 10000000) {
    showFormAlert()
  }
  return Math.log10(area / vOverH)
}

function getProbabilityRange(DBI) {
  for (let i = 0; i < POFs.length; i++) {
      if (DBI <= POFs[i].DBI) {
          if (i === 0) {
              return `Less than ${POFs[i].probability * 100}%`;
          } else {
              const lowerBound = POFs[i - 1].probability * 100;
              const upperBound = POFs[i].probability * 100;
              return `Between ${lowerBound}% and ${upperBound}%`;
          }
      }
  }
  return `Greater than ${POFs[POFs.length - 1].probability * 100}%`;
}

//function to calculate the V/H value for a given catchment area and DBI for boundary lines on graph
function calculateVOverH(area, DBI){
  return 1/(Math.pow(10, DBI)/area)
}

function update() {
  //hide alert
  hideFormAlert()
  //get form data
  formData = getFormData()
  //calculate volume
  const DBI = calculateDBI(formData)

  //display volume
  const dbiOutput = document.getElementById('dbi-output')
  const pofOutput = document.getElementById('pof-output')
  const POF = getProbabilityRange(DBI)
  dbiOutput.innerHTML = DBI.toFixed(2)
  pofOutput.innerHTML = POF
  //update Graph 
  updateGraph(formData)
}

function getFormData(){
  return {
    area: form.elements.area.value,
    volume: form.elements.volume.value,
    height: form.elements.height.value
  }
}

function updateGraph(formData){
  //get graph element from DOM
  const graph = document.getElementById('graph')

  let point = {}
  //set up trace for calculated DBI
  if(formData){
    point = {
      x: [formData.area],
      y: [((formData.volume / formData.height))],
      mode: 'markers',
      type: 'scatter',
      name: 'Calculated DBI',
      marker: {
        color: '#ff0000',
        size: 12
      }
    }
  }
  
  //calculate y values for the the POF lines
  const POFTraces = POFs.map(POF => {
    return {
      x: xValues,
      y: xValues.map(x => calculateVOverH(x, POF.DBI)),
      type: 'scatter',
      legend: "legend2",
      mode: 'lines',
      line: {
        dash: POF.dash
      },
      name: `${POF.probability*100}%`
  }})
  

  //set up real world data
  const realData = {
    stable: {
      area: [4.2665,5.9065,8.2289,3.6141,10.2639,47.1943,5.3548,15.3338,38.7237,0.3453,31.9714,30.7751,7.7743,18.3612,82.411,2.5682,87.9896,34.3309,236.8984,9.574,24.253,1.8143,9.5005,24.6893,5.3939,27.3149,53.0422,18.6676,16.1478,9.3014,52.3208,46.3316,20.8729,20.9589,19.1921,7.2785,1.4591,39.0545,1.1428,6.4577,9.8832,6.9478,13.1381,31.6521,12.2436,39.6454,53.3055,138.9558,4.3812,75.063,9.9915,351.0291,24.9885,31.9552,15.8628,5.6081,2.5884,12.0954,1.7905,2.7601,8.7868,172.3036,10.5192,31.9552,5.8284,1.1997,17.8372,0.9743,21.5372,8.5584,11.1993,47.2504,5.2165,0.8943,2.6848,6.5701,0.5171,0.6026,73.6428,2.0644,4.9952,4.3962,23.3654,1.8299,3.7303,0.388,12.5348,12.9007,3.2696,7.1117,45.817,13.1369,14.4059,3.2098,5.0095,0.4058,30.5405,31.9552,33.8061,0.6677,3.2027,11.6245,0.3821,2.5698,4.2904,0.9322,6.9523,31.1421],
      vOverH: [21183.4,30773.9,86391.65,22390.8182,320937.1429,99273.65,30559.8667,27095.48,30016.8,13824.3333,23445.3333,28259,12962.6,298617.7667,38676.7333,8065.5,18676.4,137022.8,414546.5714,17469.2,36493.8,72002.8,68404.4,233598,25818.2,108218,32208.96,273577.12,38559.9692,50459.6,303286.6667,277071.1333,112380.2286,310538.5714,39893.4,33632,8965.6,105136.72,103654,29315.4,55936,210826.7077,190598.4,469701.6,13841.8,5475.4,163559.3,347895.85,163445.6,130009.8,35893.7,6885050.4,250143.1333,165860.5333,81604.75,12007,1323762.844,82197.5,76326.3,5006,1135781.029,674326.8364,262590.1333,243351.8286,2590.5,512331.5429,886682.4,247592.56,243269.8,88931.3333,103852.44,916586.48,64341.78,49022.4,6820.8,187603.6,22184.9,37127.5,104607.48,432495,34462.5,97017.56,138957,29097.1,5070.7,10172.5,43795.6,865109.5,91808.16,163085.2,148937.8,313356.6,75274.6,180303.5111,158812.2,54139.6,356386.44,302929.0571,1104267.4,60410.6,24462.0667,415424.55,15928.2,13170,31344.8,24857.25,22363.25,136093.3714] 
    },
    unstable: {
      area: [31.7831,1.0598,104.8015,0.8253,12.6455,12.13,53.9634,9.5452,4.2479,2.044,27.4325,4387.3889,176.9798,14.8382,11.4624,5.7038,88.9643,9.0748,20.0163,1.1926,11.5407,24.2683,30.3274,9.1949,1.2309,2.0733,2.595,0.858,60.0122,17.1676,0.4248,2.3926,562.1177,3.2307,75.1775,1.3603,1.3306,1.4956,1.6131,0.696,0.6108,1.25,7.1956,25.4168,3.0933,5.7124,6.8019,0.6797,36.3461,6.4656,31.204,8.0789,7.6723,7.8568,8.5765,21.1952,8.7983,113.8788,0.6951,6.2493,54.6128,4.412,5.6788,25.8146,2.7363,16.2292,19.5549,18.3793,43.3041,0.9054,85.4766,17.9504,9.4101,1.2611,1.3251,44.0892,0.5955,0.9298,1.1837,4.1023,11.0712,46.0817,28.6974,0.5578,5.8099,5.7813,3.3501,3.1647,6.1832,4.5147,3.7366,0.5711,1.4041,15.1838,3.5392,881.291,0.929,35.4612,3.2438,2.8543,18.8172,29.5195,21.3536,32.1772,16.4054,17.2192,13.8741,0.5905,13.8947,14.5172,0.6193,87.6631,13.9375,20.7651,153.2326,6.9763,42.8102,12.4095,6.9814,11.986,17.6531,15.774,1.7794,40.9269,92.5715,1.4284,17.3736,0.5084,0.9811,2.2109,10.337,10.3758,2.6346,2.9581,5.1162,62.3725,6.8231,76.2273,3.1256,570.2024,7.0911,1.5833,0.5171,3.5135,15.7698,19.251,5.1953,13.55,26.9288,0.5096,3.0924,27.8408,0.4479,19.6792,77.8321,87.6629,8.7374],
      vOverH: [336821.925,8782.8,571485.1556,5807,10684.9333,6049.28,196680.0571,5108,4210,1750,6063.2,107998.65,11242.1,17373.9,102613.7714,2484.5,2079.6,851,3637.2,334,202940.6,39444.7667,8115.1,2623.8,3733.65,7403.1333,4841.4,7603.12,38378.9231,4061.5333,13609,167,40144.2,16647.7333,104316.8,5339.4667,15090.3,6212.2,77899.52,127086.64,3543.8,2629.2,4027.3,754.6,15076.25,8458.8,1016.4,26197.6667,2028,9252.8,4034.8,150620.975,11036.6,6434.0667,2952.8,14162.32,77647.0588,5363,429,5216.7,114576.0333,6856.2,113552.1143,1235.2,2426.8,12850.75,4444.5,8671.1333,6527.8667,3022.3333,755568.6933,5309.5,3109.7,2076.6,2072.2,146908.3556,10996.55,37984.6,5194.5,6486.7714,13454.65,186244.325,990.8,5267.8,3237.8,5873,11267,9479.8,6898.9,3870.3,10721.0667,4618.6,20305.6,25878.6,139508.4,623377.8286,5194.7333,22203.7,8741,2890.4,13842.8,15636.6,42189.75,83791.7231,8063.2,1770.6,452.2,13413.2,86977.5714,706.5,3769.6,4087.4,4150.4,87880.8,435586.5818,15234.55,163893.45,97561.06,141.4,145.4,18856.1333,4394.6,3428.4,40219.6,318290.8,4363.8,11515,720,1308.3333,6438,2828.2667,42647,82805.55,56009.45,24706.6,463,11881.9333,57447.2444,758,111454.45,2409.2,35770.8,1914.6,332.5,120,24204.7111,164794.1,168702.95,192726.45,2318.6667,522.8,849.7,8764.2,59160.7,35771.1,4545.2,22063.8] 
    },
  
  }

  //set up trace for stable points 
  const stable = {
    x: realData.stable.area.map(area => area*1000000),
    y: realData.stable.vOverH,
    mode: 'markers',
    type: 'scatter',
    name: 'Stable', 
    marker: {
      color: 'lightgrey',
      size: 8,
    }
  }

  //set up trace for unstable points
  const unstable = {
    x: realData.unstable.area.map(area => area*1000000),
    y: realData.unstable.vOverH,
    mode: 'markers',
    type: 'scatter',
    name: 'Unstable', 
    marker: {
      color: 'black',
      size: 8
      // symbol: 'circle-open'
    }
  }



  //collect traces to add to graph
  const data = [stable, unstable, point, ...POFTraces]

  //set up layout for graph
  const layout = {
    title: {
        text: 'Plot of Stable and Unstable Landslide Dams',
        font: {size: 13},
        pad: {b:100},
        yanchor: 'top',
      },
    legend: {
      orientation: 'h',
      y: -0.14,
      x: 0.32,
    },
    legend2: {
      title: {
        text: "Probability of Failure"},
      orientation: 'h',
      y: -0.2,
      x: 0,
    },
    margin: {t: 35, l: 75, r: 60, pad: 10},
    xaxis: {
      title: {
        text: 'Upstream Catchment Area (m<sup>2</sup>)',
        font: {size: 12},
      },
      dtick: 1,
      type: 'log',
      range: [5, 10], 
    },
    yaxis: {
      title: {
        text: 'Dam Volume (m<sup>3</sup>) / Max Dam Height (m)',
        font: {size: 12},
        standoff: 10 
      },
      dtick: 1,
      type: 'log',
      range: [1, 7],
      rangemode: 'tozero',
    }, 
    autosize: true,
    height: 500
  }
  //define layout
  const config = {
    displayModeBar: false,
    responsive: true
  }

  //plot graph
  Plotly.newPlot( graph, data, layout, config )
}

//hide form alert
function hideFormAlert() {
  const alert = document.getElementById('alert')
  alert.style.display = 'none'
}

//show alert
function showFormAlert() {
  const alert = document.getElementById('alert')
  alert.style.display = 'block'
  alert.innerHTML = "These values exceed the bounds of the graph and known relationship"
}


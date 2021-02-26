import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { TheSidebar, TheFooter } from "./index";
import { allcountries } from "./countries";
import Chart from "react-apexcharts";

const TheLayout = () => {
  const [alldata, setAlldata] = useState([]);
  const [eachcountry, setEachCounrty] = useState([]);
  const [country, setcountry] = useState("Germany");
  const [perday, setperday] = useState(0);
  const [lastdat, setlastday] = useState(7);
  const [chart, setchart] = useState();
  const [rate, setrate] = useState(0);


  /*

  RKI API DATA 
   
   sodu formula to calculate
   Incidence value for whole Germany =  (avg(cases7_bl_per_100k)/avg(cases7_bl_per_100k))

  */

  useEffect(() => {
    fetch(
      "https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/Coronaf%C3%A4lle_in_den_Bundesl%C3%A4ndern/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
    )
      .then((data) => data.json())
      .then((data) => {
      
        var totolnewCases = 0;
        var totalnewdeath = 0;
        data.features.map((x) => {
          totolnewCases = totolnewCases + x.attributes?.cases7_bl_per_100k;
          totalnewdeath = totalnewdeath + x.attributes?.death7_bl;
        });
        var incRate =
          totolnewCases /
          data.features.length /
          (totalnewdeath / data.features.length);
       
        setrate(incRate);
      });
  }, []);


   /*

   
   GITHUB API DATA 
   
  
   */


  useEffect(() => {
    var dump = [];
    Swal.showLoading();

    fetch("https://pomber.github.io/covid19/timeseries.json")
      .then((response) => response.json())
      .then((data) => {
        Swal.close();

        data[country].forEach(({ date, confirmed, recovered, deaths }) =>
          dump.push({
            date: date,
            active: confirmed - recovered - deaths,
            death: deaths,
            recovered,
            recovered,
            total: confirmed,
          })
        );
      
        
        var alldates = [];
        var allseries = [];

        dump.map((x) => {
          alldates.push(x.date);
          allseries.push(x.active);
        });

        setchart({
          options: {
            chart: {
              id: "basic-bar",
            },
            xaxis: {
              categories: alldates,
            },
          },
          series: [
            {
              name: "Active Cases",
              data: allseries,
            },
          ],
        });
     
        var allv = 0;
        for (var i = dump.length - 1; i >= dump.length - 7; i--) {
          var a = dump[i].active - dump[i - 1].active;
          allv = allv + a;
       
          
        }
     
        setperday(allv / 7);
        setEachCounrty(dump);

        setAlldata(data);
      });
  }, []);

   return (
    <div className="c-app c-default-layout">
      <TheSidebar />
      <div className="c-wrapper">
       <div className="c-body">
          <div className="form-inputer">
            <div className="do">
            <label>Enter country name</label>
            <input
              list="browsers"
              placeholder="Germany"
              name="browsers"
              onChange={(e) => {
                setlastday(7);
                var dump = [];
                setcountry(e.target.value);
                alldata[e.target.value]?.forEach(
                  ({ date, confirmed, recovered, deaths }) =>
                    dump.push({
                      date: date,
                      active: confirmed - recovered - deaths,
                      death: deaths,
                      recovered,
                      recovered,
                      total: confirmed,
                    })
                );

                var alldates = [];
                var allseries = [];
                setEachCounrty(dump);
                dump.map((x) => {
                  alldates.push(x.date);
                  allseries.push(x.active);
                });

                setchart({
                  options: {
                    chart: {
                      id: "basic-bar",
                    },
                    xaxis: {
                      categories: alldates,
                    },
                  },
                  series: [
                    {
                      name: "Active Cases",
                      data: allseries,
                    },
                  ],
                });
                var allv = 0;
                for (var i = dump.length - 1; i >= dump.length - 7; i--) {
                  var a = dump[i]?.active - dump[i - 1]?.active;
                  allv = allv + a;
                
                }
             
                setperday(allv / 7);
              }}
            />
            </div>
            <div className="telegram">
              Telegram Bot Id : t.me/covid_covid_dovic_bot
              <button
               onClick={async ()=>{
                  Swal.showLoading()
                  fetch('https://api.telegram.org/bot1697033506:AAEElQHeZydY-S5ZbX4tXs2z1pWdkqywC-A/getUpdates', {
                    method: 'POST', // or 'PUT'
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    
                  })
                  .then(response => response.json())
                  .then(data => {
                       var removeDuplicate = []; 
                       data.result.map(x=>{
                         if(!removeDuplicate.includes(x.message?.chat?.id)) {
                          removeDuplicate.push(x.message?.chat?.id)
                          var text = `Country: ${country}\r
                          Total Cases: ${ eachcountry.length > 0 ? eachcountry[eachcountry.length - 1]?.total: 0}\r
                          Active Cases/Total infections: ${eachcountry.length > 0 ? eachcountry[eachcountry.length - 1]?.active: 0}\r
                          Total infections Last 24 hours:   ${eachcountry.length > 0
                            ? eachcountry[eachcountry.length - 1]?.active -
                              eachcountry[eachcountry.length - 2]?.active
                            : 0}\r
                          Total Death: ${eachcountry.length > 0 ? eachcountry[eachcountry.length - 1]?.death: 0}\r
                          Recovered: ${eachcountry.length > 0 ? eachcountry[eachcountry.length - 1]?.recovered: 0}\r
                          `
                        fetch(`https://api.telegram.org/bot1697033506:AAEElQHeZydY-S5ZbX4tXs2z1pWdkqywC-A/sendMessage?chat_id=${x.message?.chat?.id}&text=${text}`, {
                          method: 'POST', // or 'PUT'
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          
                        })}
                       })
                       Swal.fire({
                        icon: 'success',
                        title: 'Sent',
                        
                      })
                  })
                  .catch((error) => {
                    console.error('Error:', error);
                  });
               }}
              >Send Data to Telegram now</button> 
               
            </div>
          </div>
          <div className="mixed-chart">
            <div className="charter">
            {chart && (
              <Chart options={chart.options} series={chart.series} type="bar"  />
            )}
            </div>
            <div className="charter">
             {chart && (
              <Chart options={chart.options} series={chart.series} type="line"  />
            )}
            </div>
          </div>
          <datalist id="browsers">
            {allcountries.map((x) => {
              return <option value={x.name}>{x.name}</option>;
            })}
          </datalist>
          <div className="boxes">
            <div className="boxer">
              <h1>Country</h1>
              <h5>{country}</h5>
            </div>

            <div className="boxer">
              <h1>Total Cases</h1>
              <h5>
                {eachcountry.length > 0
                  ? eachcountry[eachcountry.length - 1]?.total
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <h1>Active Cases / Total infections</h1>
              <h5>
                {eachcountry.length > 0
                  ? eachcountry[eachcountry.length - 1]?.active
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <h1>Total Infections Last 24 Hours</h1>
              <h5>
                {eachcountry.length > 0
                  ? eachcountry[eachcountry.length - 1]?.active -
                    eachcountry[eachcountry.length - 2]?.active
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <h1>Total Death</h1>
              <h5>
                {eachcountry.length > 0
                  ? eachcountry[eachcountry.length - 1].death
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <h1>Recovered</h1>
              <h5>
                {eachcountry.length > 0
                  ? eachcountry[eachcountry.length - 1].recovered
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <input
                type="number"
                max="300"
                min="1"
                placeholder="Enter no. of days"
                onChange={(e) => {
                  if (e.target.value > 365 || e.target.value < 1) {
                  } else {
                    setlastday(e.target.value);
                    var allv = 0;
                    for (
                      var i = eachcountry.length - 1;
                      i >= eachcountry.length - e.target.value;
                      i--
                    ) {
                      var a =
                        eachcountry[i]?.active - eachcountry[i - 1]?.active;
                      allv = allv + a;
                    
                    }
                 
                    setperday(allv / e.target.value);
                  }
                }}
              />
              <h1>Average Increase last {lastdat} days</h1>
              <h5>{perday?.toFixed(3)}</h5>
            </div>
          </div>
           <br />  <br />
          <h1>Data From RKI ( GERMANY ONLY )</h1>
          <div className="boxes">
            <div className="boxer">
              <h1>Incidence value for whole Germany</h1>
              <h5>{rate?.toFixed(3)}</h5>
            </div>

            <div className="boxer">
              <h1>Target Total Infection</h1>
                {/* 
                 totalTarget = (totalCurrent / incidenceCurrent) * incidenceTarget (e.g., 35).
                */}
              <h5>
                {eachcountry.length > 0
                  ? (
                      (eachcountry[eachcountry.length - 1]?.active / rate) *
                      35
                    )?.toFixed(3)
                  : 0}
              </h5>
            </div>

            <div className="boxer">
              <h1>Prediction</h1>
              <h5>
                {/* 
                 days = (totalCurrent - totalTarget) / decreaseAverage
                */}
                {eachcountry.length > 0
                  ? (
                      (eachcountry[eachcountry.length - 1]?.active -
                        (eachcountry[eachcountry.length - 1]?.active / rate) *
                          35) /
                      perday
                    )?.toFixed(3) + " days"
                  : 0}
              </h5>
            </div>
          </div>
          <TheFooter />
        </div>
      </div>
    </div>
  );
};

export default TheLayout;

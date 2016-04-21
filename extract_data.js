d3.json("scpd_incidents.json", function(scpd_incidents) {
 scpd_incidents.forEach(function(d) {
 d.date = format.parse(d.date);
 });
});
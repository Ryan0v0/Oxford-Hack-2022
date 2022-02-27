// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';


function draw_pie_chart(id, x, y, colors) {
    // Pie Chart Example
    var ctx = document.getElementById(id);
    var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: x,
            datasets: [{
                data: y,
                backgroundColor: colors,
                // hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var label = chart.labels[tooltipItem.index] || '';
                        var value = chart.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toFixed(2);
                        return label + ": " + value + "W";
                    }
                }
            },
            legend: {
                display: false,
                position: 'bottom',
                padding: 20,
                labels:{
                    boxWidth: 12
                }
            },
            cutoutPercentage: 80,
        },
    });
}
import * as tf from '@tensorflow/tfjs';
import Chart from 'chart.js/auto';

// Sample Data
const data2021 = [
    { antimicrobial: 'Antibiotic A', pooledDays: 120, percentageDays: 60 },
    { antimicrobial: 'Antibiotic B', pooledDays: 200, percentageDays: 75 },
];
const data2022 = [
    { antimicrobial: 'Antibiotic A', pooledDays: 130, percentageDays: 65 },
    { antimicrobial: 'Antibiotic B', pooledDays: 210, percentageDays: 80 },
];

// Combine and Normalize Data
const combinedData = [...data2021, ...data2022].map((d, index) => ({
    ...d,
    pooledDaysNorm: d.pooledDays / 250,
    percentageDaysNorm: d.percentageDays / 100,
    year: index < 2 ? 2021 : 2022,
}));

// PCA Transformation
const pcaInput = combinedData.map((d) => [d.pooledDaysNorm, d.percentageDaysNorm]);
const pcaTensor = tf.tensor(pcaInput);
const pca = tf.svd(pcaTensor);

// Extract PCA Components
const pc1 = pca.u.slice([0, 0], [-1, 1]).arraySync();
const pc2 = pca.u.slice([0, 1], [-1, 1]).arraySync();
combinedData.forEach((d, i) => {
    d.pc1 = pc1[i][0];
    d.pc2 = pc2[i][0];
});

// Render PCA Graph
document.addEventListener('DOMContentLoaded', function () {
    const pcaCtx = document.getElementById('pcaChart').getContext('2d');
    new Chart(pcaCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: '2021 Data',
                    data: combinedData.filter((d) => d.year === 2021).map((d) => ({ x: d.pc1, y: d.pc2 })),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: '2022 Data',
                    data: combinedData.filter((d) => d.year === 2022).map((d) => ({ x: d.pc1, y: d.pc2 })),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'PCA Transformation of Antimicrobial Data (2021-2022)',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'PC1',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'PC2',
                    },
                },
            },
        },
    });
});

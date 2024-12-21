import * as tf from '@tensorflow/tfjs';
import Chart from 'chart.js/auto';

// Sample Data: Antimicrobials and metrics
const data2021 = [
    { antimicrobial: 'Antibiotic A', pooledDays: 120, percentageDays: 60, spectrum: 'Narrow' },
    { antimicrobial: 'Antibiotic B', pooledDays: 200, percentageDays: 75, spectrum: 'Broad' },
];
const data2022 = [
    { antimicrobial: 'Antibiotic A', pooledDays: 130, percentageDays: 65, spectrum: 'Narrow' },
    { antimicrobial: 'Antibiotic B', pooledDays: 210, percentageDays: 80, spectrum: 'Broad' },
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

// Clustering by Spectrum
const clusters = combinedData.reduce((acc, item) => {
    if (!acc[item.spectrum]) acc[item.spectrum] = [];
    acc[item.spectrum].push(item);
    return acc;
}, {});

// Render Charts After DOM Load
document.addEventListener('DOMContentLoaded', function () {
    // 1. PCA Transformation Graph
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

    // 2. Bar Chart of Antimicrobials Found
    const barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: combinedData.map((d) => d.antimicrobial),
            datasets: [
                {
                    label: 'Pooled Days',
                    data: combinedData.map((d) => d.pooledDays),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                },
                {
                    label: 'Percentage Days',
                    data: combinedData.map((d) => d.percentageDays),
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Antimicrobials Metrics (Pooled Days & Percentage Days)',
                },
            },
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    // 3. Clustering by Spectrum
    const clusterCtx = document.getElementById('clusterChart').getContext('2d');
    new Chart(clusterCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(clusters),
            datasets: [
                {
                    label: 'Spectrum Clustering',
                    data: Object.values(clusters).map((group) => group.length),
                    backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
                },
            ],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Clustering of Antimicrobials by Spectrum',
                },
            },
            responsive: true,
        },
    });
});

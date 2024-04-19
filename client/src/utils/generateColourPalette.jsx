export const generateColourPalette = (imageData) => {


  // Initiate array to store the colour of every pixel
  const colours = [];

  // Save colour value of each pixel into colours
  for (let i = 0; i < imageData.data.length; i += 4) {
    //const colour = `${imageData.data[i]},${imageData.data[i + 1]},${imageData.data[i + 2]}`;
    const colour = [imageData.data[i], imageData.data[i+1], imageData.data[i+2]];
    colours.push(colour);
      }
  
  // Calculate distance between two colours
  function distance(col1, col2) {
    let sum = 0;
    for (let i = 0; i < col1.length; i ++) {
      //console.log(col1[i]);
      sum += Math.pow(col1[i] - col2[i], 2);
    }
    return Math.sqrt(sum);
  }

  // Check if color is black, return true if it is not black
  function notBlack(colour){
    for(let i = 0; i < colour.length; i++){
      if (colour[i] !== 0) {
        return true;
      }
    }
    return false;
  }

  function initializeCentroids(colours, k) {
    const centroids = [];

    // Filter out black pixel that are not in the segmentation
    const filteredColours = colours.filter(colour => notBlack(colour) === true);

    // Randomly select k points from the colours array
    for (let i = 0; i < k; i++) {
      centroids.push(filteredColours[Math.floor(Math.random() * filteredColours.length)]);
    }
    return centroids;
  }

  function assignClusters(colours, centroids) {
    const clusters = new Array(centroids.length).fill().map(() => []);
    const clusterIndex = []
    colours.forEach(colour => {
      // Find the index of the closest centroid
      const distances = centroids.map(centroid => distance(colour, centroid));
      const closestCentroidIndex = distances.indexOf(Math.min(...distances));
      // Assign the point to the cluster corresponding to the closest centroid
      clusters[closestCentroidIndex].push(colour);
      clusterIndex.push(closestCentroidIndex);
    });
    return {clusters, clusterIndex};
  }

  function updateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) return null;
      const centroids = cluster[0].map((_, i) => cluster.reduce((acc, curr) => acc + curr[i], 0) / cluster.length);
      return centroids;
    }).filter(centroid => centroid !== null); // Filter out null centroids
  }

  // Perform the main clustering
  function kMeans(colours, k, maxIterations = 100) {
    let centroids = initializeCentroids(colours, k);
    let iteration = 0;
    let prevClusters = null;
    let finalClusterIndex = null;

    while (iteration < maxIterations) {
      const {clusters, clusterIndex} = assignClusters(colours, centroids);

      // Check for convergence
      if (JSON.stringify(clusters) === JSON.stringify(prevClusters)) {
        finalClusterIndex = clusterIndex;
        break;
      }

      // Update centroids
      centroids = updateCentroids(clusters);

      prevClusters = clusters;
      iteration++;
    }

    // If loop terminated due to convergence, set finalClusterIndex
    if (iteration === maxIterations) {
      finalClusterIndex = assignClusters(colours, centroids).clusterIndex;
    }

    return { centroids, finalClusterIndex };
  }

  // Convert RGB color to HEX color
  function rgbToHex(colour) {
    const r = Math.round(colour[0]);
    const g = Math.round(colour[1]);
    const b = Math.round(colour[2]);
    const toHex = (c) => {
      const hex = c.toString(16);
      // Add 0 if single digit
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  const { centroids: centroids, finalClusterIndex } = kMeans(colours, 6);
  
  // Print out finalClusterIndex
  //console.log('Cluster Index:');
  //console.log(finalClusterIndex);

  const palette = [];

  // Push finalClusterIndex to palette before the colours.
  // When the colors are read, they will ignore the 0 index
  palette.push(finalClusterIndex);

  for (let i = 0; i < centroids.length; i++){
    palette.push(rgbToHex(centroids[i]));
  }
  
  return palette;
};

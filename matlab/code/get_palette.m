function [lab_palette, pixel_clusters, palette_img] = get_palette(img, radius)
    img_lab = rgb2lab(img);
    [h, w, c] = size(img_lab);
    pixels = reshape(img_lab, h * w, c);

    % Extract only the chromatic channels, not the luminance
    chroma = pixels(:, 2:3)';

    % Mean Shift Cluster on chroma
    [clusterCenters, idx, ~] = MeanShiftCluster(chroma, radius, 0);

    num_colours = size(clusterCenters, 2);
    pixel_clusters = reshape(idx, h, w);

    % Save chromaticity to LAB palette
    lab_palette = clusterCenters';

    palette = zeros(num_colours, 3);
    palette_img = zeros(10, num_colours * 10, 3);

    % Build palette and palette image
    for i = 1:num_colours
        % Make a mask for each cluster
        cluster_mask = pixel_clusters == i;
        cluster_pixels = img(repmat(cluster_mask, [1, 1, 3]));
        cluster_pixels = reshape(cluster_pixels, [], 3);

        % Remove zero rows (which correspond to black pixels)
        cluster_pixels = cluster_pixels(any(cluster_pixels, 2), :);

        % Find the mean value for each colour channel
        palette(i, :) = mean(cluster_pixels, 1);
        palette_img(:, (i-1)*10+1:i*10, :) = repmat(reshape(palette(i, :), 1, 1, 3), 10, 10);
    end
end
function [lab_palette, pixel_clusters, palette_img] = get_palette(img, radius)

    %Convert from RGB to LAB
    img = rgb2lab(img);

    %Resize image if too large
    %img = imresize(img, 0.25);
    
    % Reshape the image so each row is a pixels color
    [h, w, c] = size(img);
    pixels = reshape(img, h * w, c);

    % Extract only the chromatic chanels, not the luminance
    chroma = pixels(:,2:3);

    % Mean Shift Cluster on chroma
    [clusterCenters, idx, ~] = MeanShiftCluster(chroma', radius, 0);

    % Get the number of color clusters
    num_colors = size(clusterCenters,2);

    % Reshape the clustering results
    pixel_clusters = reshape(idx, h, w);

    % Save chomaticity to LAB palette
    lab_palette = clusterCenters';

    % Define color palette
    palette = zeros(num_colors, 3);

    % Define image to show palette
    palette_img = zeros(10, num_colors*10, 3);

    % Need LAB for mean shift clustering but converting back to RGB to
    % form palette
    img = lab2rgb(img);

     % Build palette and palette image
    for i = 1:num_colors

        % Make a mask for each cluster
        cluster_mask = pixel_clusters == i;

        % Isolate the color chanels from image
        ch1 = img(:,:,1);
        ch2 = img(:,:,2);
        ch3 = img(:,:,3);

        % Use cluster_mask to set pixels not in cluster to 0
        ch1(~cluster_mask) = 0;
        ch2(~cluster_mask) = 0;
        ch3(~cluster_mask) = 0;

        % Find the mean value for each color chanel
        ch1_mean = mean(nonzeros(ch1), 'all');
        ch2_mean = mean(nonzeros(ch2), 'all');
        ch3_mean = mean(nonzeros(ch3), 'all');

        % Combine the chanels into one color then put in palette
        palette(i,:) = [ch1_mean, ch2_mean, ch3_mean];

        % Make palette image
        for j = 1:10
            for k = (i*10)-9:(i*10)
                palette_img(j,k,:) = palette(i,:);
            end
        end
    end








function output = recolor_image(img, segment, palette, pixel_clusters, index, color_rgb)

    mask = rgb2gray(segment);
    mask = mask ~= 0;

    segment = rgb2lab(segment);

    color_rgb = color_rgb / 255;
    color = rgb2lab(color_rgb);
    
    color_mask = pixel_clusters == index;
    
    l = segment(:,:,1);
    a = segment(:,:,2);
    b = segment(:,:,3);

    % Change Chroma
    temp_a = a;
    a(color_mask) = 0;
    temp_a = temp_a - palette(index,1);
    temp_a = temp_a + color(1,2);
    temp_a(~color_mask) = 0;
    a = a + temp_a;

    temp_b = b;
    b(color_mask) = 0;
    temp_b = temp_b - palette(index,2);
    temp_b = temp_b + color(1,3);
    temp_b(~color_mask) = 0;
    b = b + temp_b;

    % Reconstruct layers of the segment
    segment(:,:,1) = l;
    segment(:,:,2) = a;
    segment(:,:,3) = b;

    segment = lab2rgb(segment);
    img = im2double(img);

    % Combine the segment and original image back together
    img(:,:,1) = img(:,:,1) .* ~mask;
    img(:,:,2) = img(:,:,2) .* ~mask;
    img(:,:,3) = img(:,:,3) .* ~mask;

    segment(:,:,1) = segment(:,:,1) .* mask;
    segment(:,:,2) = segment(:,:,2) .* mask;
    segment(:,:,3) = segment(:,:,3) .* mask;

    img = img + segment;

    output = img;
    

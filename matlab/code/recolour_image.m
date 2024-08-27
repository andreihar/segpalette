function output = recolour_image(img, segment, palette, pixel_clusters, index, colour_rgb)
    mask = rgb2gray(segment) ~= 0;
    segment_lab = rgb2lab(segment);
    colour_lab = rgb2lab(colour_rgb / 255);
    colour_mask = pixel_clusters == index;
    
    l = segment_lab(:,:,1);
    a = segment_lab(:,:,2);
    b = segment_lab(:,:,3);

    % Change Chroma
    a(colour_mask) = a(colour_mask) - palette(index,1) + colour_lab(1,2);
    b(colour_mask) = b(colour_mask) - palette(index,2) + colour_lab(1,3);

    % Reconstruct layers of the segment
    segment_lab = cat(3, l, a, b);
    segment_rgb = lab2rgb(segment_lab);
    img = im2double(img);

    % Combine the segment and original image back together
    img(:,:,1) = img(:,:,1) .* ~mask;
    img(:,:,2) = img(:,:,2) .* ~mask;
    img(:,:,3) = img(:,:,3) .* ~mask;

    img(:,:,1) = img(:,:,1) + segment_rgb(:,:,1) .* mask;
    img(:,:,2) = img(:,:,2) + segment_rgb(:,:,2) .* mask;
    img(:,:,3) = img(:,:,3) + segment_rgb(:,:,3) .* mask;

    output = img; 
end
clc, clear;

%% This Demo requires the original image, and binary masks from the segmentation.json file

% Some provide example images and masks can be found in the machu,
% Interior1, Interior2, and interior3 folder. These each contain the
% original image as "image.jpc" and the masks as "mask_#.jpg"

% Load your source image
source = imread('interior1\image.jpg');

% Load binary mask of the segmant
mask = imread('interior1\mask_0.png');
mask = imbinarize(mask);

% Get the segmented part of the image
% This code is from ChatGPT using the prompt "I have an rgb image in matlab and a binary mask, how can i select just the masked region of the image"
segment = bsxfun(@times, source, cast(mask, 'like', source));

% Preview the segment that has been loaded
imshow(segment);

%% Generate the colour palette of the image segment

% Palette generation is using mean shift algorithm so the range may need to
% be adjusted to get the desired nuber of colours in the palette
% a smaller range will give more colours and a larger range less
range = 6;
[lab_palette, pixel_clusters, palette] = get_palette(segment,range); 

% Display the segment and the colour palette
subplot(1, 2, 1);
imshow(segment);
title('Image Segment');

subplot(1, 2, 2);
imshow(palette);
title('Mean Shift Palette');

%% Recolour the image by chosing a color and the palette index you want to replace

% Set the RGB colour that you want to use
%color = [66, 132, 245]; %Blue
color = [245, 236, 66]; %Yellow

% The index of the palette colour to replace
palette_index = 3;

recoloured_image = recolor_image(source, segment, lab_palette, pixel_clusters, palette_index, color);

% Display original and LAB images
subplot(1, 2, 1);
imshow(segment);
title('Original RGB Image');

subplot(1, 2, 2);
imshow(recoloured_image);
title('Mean Shift Palette');

%% If you want to recolour another palette color in this segment run this, then continue to the recoloring part again.
segment = bsxfun(@times, recoloured_image, cast(mask, 'like', recoloured_image));
range = 6;
[lab_palette, pixel_clusters, palette] = get_palette(segment,range); 

% Display the segment and the colour palette
subplot(1, 2, 1);
imshow(segment);
title('Image Segment');

subplot(1, 2, 2);
imshow(palette);
title('Mean Shift Palette');

%% Save the recolored image
imwrite(recoloured_image, 'output/recolored.jpg', 'jpg');







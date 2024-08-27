clc, clear; close all;

%% This Demo requires the original image, and binary masks from the segmentation.json file

% Some provided example images and masks can be found in the machu,
% interior1, interior2, and interior3 folders. These each contain the
% original image as "image.jpg" and the masks as "mask_#.png"

% Load your source image
source = imread('..\data\interior1\image.jpg');

% Load binary mask of the segment
mask = imread('..\data\interior1\mask_0.png');
mask = imbinarize(mask);

% Get the segmented part of the image
% This code is from ChatGPT using the prompt "I have an rgb image in matlab and a binary mask, how can i select just the masked region of the image"
segment = im2double(bsxfun(@times, source, cast(mask, 'like', source)));

% Preview the segment that has been loaded
imshow(segment);

%% Generate the colour palette of the image segment

% Palette generation is using mean shift algorithm so the range may need to
% be adjusted to get the desired nuber of colours in the palette
% a smaller range will give more colours and a larger range less
range = 6;
[lab_palette, pixel_clusters, palette] = get_palette(segment,range); 

% Display the segment and the colour palette
figure;
subplot(1, 2, 1);
imshow(segment);
title('Image Segment');

subplot(1, 2, 2);
imshow(palette);
title('Mean Shift Palette');

%% Recolour the image by chosing a colour and the palette index you want to replace

% Set the RGB colour that you want to use
colour_rgb = [66, 132, 245]; %Blue

% The index of the palette colour to replace
palette_index = 3;

recoloured_image = recolour_image(source, segment, lab_palette, pixel_clusters, palette_index, colour_rgb);

% Display original and LAB images
figure;
subplot(1, 2, 1);
imshow(source);
title('Original RGB Image');

subplot(1, 2, 2);
imshow(recoloured_image);
title('Mean Shift Palette');

%% Save the recoloured image
imwrite(recoloured_image, '../recoloured.jpg', 'jpg');
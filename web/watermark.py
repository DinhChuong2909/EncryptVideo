# Step 
# . Convert the content video from RGB to YUV format 
# for efficient coding. 
# 2. Group together k no. of frames from the content video 
# where each frame is divided into non-overlapping 
# blocks of pixels to form a cube. Extract m DWT 
# components from each block to create matrix A. Apply 
# Principal Component Algorithm (PCA) on matrix A to 
# generate matrix B where each row of the matrix is a
# Eigen vector. 
# 3. Calculate supporting bit S by taking the difference of 
# the central value and the mean of the other values from 
# the first Eigen vector. If the difference is non-negative 
# then S = 1 else S = -1. 
# 4. There are five conditions to embed the watermarking
# bit:- 
# i. If watermarking bit = +1 and the selected coefficient is 
# situated in the center of the block then multiply the 
# coefficient with the strength factor. 
# ii. If watermarking bit = -1 and the selected coefficient is 
# situated in the center of the block then multiply the 
# coefficient with the inverse of the strength factor. 
# iii. If watermarking bit = +1 and the selected coefficient is 
# not situated in the center of the block then multiply the 
# coefficient with the strength factor. 
# iv. If watermarking bit = -1 and the selected coefficient is 
# situated in the center of the block then multiply the 
# coefficient with the inverse of strength factor 
# v. If supporting bit S and watermarking bit has different 
# values than ignore the cube 
# In each of the cube one bit is used as side information bit to 
# verify whether the cube contains watermarking bits.

import cv2
import numpy as np
import pywt
from sklearn.decomposition import PCA

# Load your video file (replace with your actual video file)
video_path = 'suburbia-aerial.mp4'

# Read the video
cap = cv2.VideoCapture(video_path)

# Define parameters
k = 5  # Number of frames to group together
m = 3  # Number of DWT components
strength_factor = 0.5  # Strength factor for embedding

# Initialize the video writer
fourcc = cv2.VideoWriter_fourcc(*'XVID')
output_video_path = 'watermarked_video.avi'
fps = int(cap.get(cv2.CAP_PROP_FPS))
frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
out = cv2.VideoWriter(output_video_path, fourcc, fps, frame_size)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Convert frame from RGB to YUV
    frame_yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)

    # Apply DWT (using Haar wavelet as an example)
    coeffs = pywt.dwt2(frame_yuv[:, :, 0], 'haar')

    # Extract approximation coefficients (LL) and detail coefficients (LH, HL, HH)
    cA, (cH, cV, cD) = coeffs

    # Calculate supporting bit S (example: based on mean)
    central_value = cA[0, 0]
    mean_other_values = np.mean(cA[0, 1:])
    S = 1 if central_value - mean_other_values >= 0 else -1

    # Watermarking conditions (example: multiply by strength factor)
    watermarking_bit = 1  # Example: +1 or -1
    selected_coefficient = cA[0, 0]  # Example: center of the block

    if watermarking_bit == 1:
        selected_coefficient *= strength_factor
    elif watermarking_bit == -1:
        selected_coefficient *= 1 / strength_factor

    # Update the approximation coefficients with the watermarked coefficient
    cA[0, 0] = selected_coefficient

    # Perform inverse DWT to get the watermarked frame
    frame_yuv[:, :, 0] = pywt.idwt2((cA, (cH, cV, cD)), 'haar')

    # Convert back to BGR for display (optional)
    frame_watermarked = cv2.cvtColor(frame_yuv, cv2.COLOR_YUV2BGR)

    # Write the watermarked frame to the output video
    out.write(frame_watermarked)

    # Display the watermarked frame (optional)
    cv2.imshow('Watermarked Video', frame_watermarked)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
out.release()
cv2.destroyAllWindows()

# The output size is too large + video length is longer

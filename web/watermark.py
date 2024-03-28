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


import numpy as np
import cv2
import pywt
from sklearn.decomposition import PCA

# Function to convert RGB to YUV
def rgb_to_yuv(rgb_frame):
    yuv_frame = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2YUV)
    return yuv_frame

# Function to group frames, divide into blocks, extract DWT components, and apply PCA
def process_frames(frames, k, m):
    grouped_frames = [frames[i:i+k] for i in range(0, len(frames), k)]
    processed_blocks = []
    for frame_group in grouped_frames:
        for frame in frame_group:
            blocks = divide_into_blocks(frame)
            for block in blocks:
                dwt_components = extract_dwt_components(block, m)
                if len(dwt_components) == m * m:  # Ensure valid number of DWT coefficients
                    pca_components = apply_pca(dwt_components)
                    processed_blocks.append(pca_components)
    return processed_blocks

# Function to divide a frame into non-overlapping blocks
def divide_into_blocks(frame):
    block_size = 8  # Assuming block size of 8x8
    blocks = []
    h, w, _ = frame.shape
    for y in range(0, h, block_size):
        for x in range(0, w, block_size):
            block = frame[y:y+block_size, x:x+block_size]
            blocks.append(block)
    return blocks

# Function to extract DWT components from each block
def extract_dwt_components(block, m):
    coeffs = pywt.dwt2(block, 'haar')  # Applying 2D DWT using Haar wavelet
    return coeffs[0][:m, :m].flatten()

# Function to apply PCA on matrix A
def apply_pca(matrix_a):
    pca = PCA()
    pca.fit(matrix_a.reshape(-1, len(matrix_a)))  # Reshape matrix to ensure each row represents a sample
    return pca.components_

# Function to calculate supporting bit S
def calculate_supporting_bit(eigen_vector):
    central_value = eigen_vector[len(eigen_vector)//2]
    mean_other_values = np.mean(np.delete(eigen_vector, len(eigen_vector)//2))
    difference = central_value - mean_other_values
    supporting_bit = 1 if difference >= 0 else -1
    return supporting_bit

# Function to embed watermarking bit based on specified conditions
def embed_watermarking_bit(eigen_vector, supporting_bit, watermarking_bit, strength_factor):
    center_index = len(eigen_vector) // 2
    if supporting_bit == watermarking_bit:
        if watermarking_bit == 1:
            eigen_vector[center_index] *= strength_factor
        else:
            eigen_vector[center_index] /= strength_factor

# Function to encode video with watermarking
def encode_video(input_path, output_path, k, m, strength_factor):
    content_video = cv2.VideoCapture(input_path)
    frame_width = int(content_video.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(content_video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(content_video.get(cv2.CAP_PROP_FPS))
    output_video = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    frames = []
    while True:
        ret, frame = content_video.read()
        if not ret:
            break
        yuv_frame = rgb_to_yuv(frame)
        frames.append(yuv_frame)
    processed_blocks = process_frames(frames, k, m)
    # Assuming watermarking bit is determined externally
    watermarking_bit = 1
    for block in processed_blocks:
        for eigen_vector in block:
            supporting_bit = calculate_supporting_bit(eigen_vector)
            embed_watermarking_bit(eigen_vector, supporting_bit, watermarking_bit, strength_factor)
    # Reconstruct frames from processed blocks and write to output video
    for i, frame_blocks in enumerate(processed_blocks):
        reconstructed_frame = np.zeros_like(frames[i])
        for j, block in enumerate(frame_blocks):
            row_start = (j // (frame_width // 8)) * 8
            row_end = row_start + 8
            col_start = (j % (frame_width // 8)) * 8
            col_end = col_start + 8
            reconstructed_block = reconstruct_block(block).reshape((8, 8, 3))
            reconstructed_frame[row_start:row_end, col_start:col_end, :] = reconstructed_block
        output_video.write(cv2.cvtColor(reconstructed_frame, cv2.COLOR_YUV2BGR))
        
    content_video.release()
    output_video.release()

# Function to reconstruct a block from DWT coefficients
def reconstruct_block(dwt_coefficients):
    reconstructed_block = np.zeros((8, 8, 3))
    reconstructed_block[:, :, 0] = pywt.idwt2((dwt_coefficients[:64]).reshape((8, 8)), 'haar')
    reconstructed_block[:, :, 1] = pywt.idwt2((dwt_coefficients[64:128]).reshape((8, 8)), 'haar')
    reconstructed_block[:, :, 2] = pywt.idwt2((dwt_coefficients[128:192]).reshape((8, 8)), 'haar')
    return reconstructed_block

# Example usage
encode_video('suburbia-aerial.mp4', 'watermarked_video.mp4', k=10, m=3, strength_factor=1.5)

# Xu ly lau qua
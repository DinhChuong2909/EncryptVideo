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


# import cv2
# import numpy as np
# import pywt
# from sklearn.decomposition import PCA

# # Load your video file (replace with your actual video file)
# video_path = 'suburbia-aerial.mp4'

# # Read the video
# cap = cv2.VideoCapture(video_path)

# # Define parameters
# k = 5  # Number of frames to group together
# strength_factor = 0.5  # Strength factor for embedding

# # Initialize the video writer
# fourcc = cv2.VideoWriter_fourcc(*'XVID')
# output_video_path = 'watermarked_video.avi'
# fps = int(cap.get(cv2.CAP_PROP_FPS))
# frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
# out = cv2.VideoWriter(output_video_path, fourcc, fps, frame_size + 1)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         break

#     # Convert frame from RGB to YUV
#     frame_yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)

#     # Divide each frame into non-overlapping blocks (e.g., 4x4 blocks)
#     block_size = 4
#     num_blocks_x = frame_yuv.shape[1] // block_size
#     num_blocks_y = frame_yuv.shape[0] // block_size

#     for i in range(num_blocks_y):
#         for j in range(num_blocks_x):
#             block = frame_yuv[i * block_size: (i + 1) * block_size, j * block_size: (j + 1) * block_size]

#             # Apply DWT to each block and extract coefficients (LL, LH, HL, HH)
#             coeffs = pywt.dwt2(block[:, :, 0], 'haar')
#             cA, (cH, cV, cD) = coeffs

#             # Update matrix A with the extracted coefficients
#             # (You can choose which coefficients to use based on your requirements)

#             # Apply watermarking to the selected coefficients (e.g., modify cA[0, 0])
#             watermarking_bit = 1  # Example: +1 or -1
#             selected_coefficient = cA[0, 0]  # Example: center of the block

#             if watermarking_bit == 1:
#                 selected_coefficient *= strength_factor
#             elif watermarking_bit == -1:
#                 selected_coefficient *= 1 / strength_factor

#             cA[0, 0] = selected_coefficient

#             # Perform inverse DWT to get the watermarked block
#             block[:, :, 0] = pywt.idwt2((cA, (cH, cV, cD)), 'haar')

#             # Update the frame with the watermarked block
#             frame_yuv[i * block_size: (i + 1) * block_size, j * block_size: (j + 1) * block_size] = block

#     # Convert back to BGR for writing to the output video
#     frame_watermarked = cv2.cvtColor(frame_yuv, cv2.COLOR_YUV2BGR)

#     # Resize the frame to the original size
#     frame_watermarked = cv2.resize(frame_watermarked, frame_size)

#     # Write the watermarked frame to the output video
#     out.write(frame_watermarked)

# cap.release()
# out.release()
# # The output size is too large + video length is longer

import cv2
import numpy as np
import pywt
from sklearn.decomposition import PCA

def read_video(video_path):
    cap = cv2.VideoCapture(video_path)
    return cap

def initialize_video_writer(output_video_path, fps, frame_size):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video_path, fourcc, fps, frame_size)
    return out

def apply_dwt(frame_yuv, block_size):
    # Perform PCA on matrix A to generate matrix B
    # Each row of matrix B corresponds to an eigenvector
    # Return matrix B
    coeffs = pywt.dwt2(frame_yuv[:, :, 0], 'haar')
    cA, (_, _, _) = coeffs
    return cA

def apply_pca(matrix_A):
    # Center the data (subtract mean from each column)
    centered_data = matrix_A - np.mean(matrix_A, axis=0)

    # Compute the covariance matrix
    covariance_matrix = np.cov(centered_data, rowvar=False)

    # Perform eigenvalue decomposition
    eigenvalues, eigenvectors = np.linalg.eigh(covariance_matrix)

    # Sort eigenvectors by eigenvalues (descending order)
    sorted_indices = np.argsort(eigenvalues)[::-1]
    sorted_eigenvectors = eigenvectors[:, sorted_indices]

    # Keep the top k eigenvectors (where k is the desired dimensionality)
    k = 2  # Example: Keep the top 2 eigenvectors
    matrix_B = sorted_eigenvectors[:, :k]

    return matrix_B

def calculate_supporting_bit(matrix_B):
    # Calculate the difference between consecutive rows
    row_differences = np.diff(matrix_B, axis=0)

    # Determine the supporting bit
    supporting_bit = np.where(row_differences >= 0, 1, -1)

    return supporting_bit

def embed_watermark(selected_coefficient, watermarking_bit, strength_factor, supporting_bit):
    # Check if all elements in the arrays are equal
    if np.array_equal(watermarking_bit, supporting_bit):
        if watermarking_bit == 1:
            selected_coefficient *= strength_factor
        elif watermarking_bit == -1:
            selected_coefficient *= (1 / strength_factor)
    
    return selected_coefficient

def encode():
    video_path = 'suburbia-aerial.mp4'
    cap = read_video(video_path)

    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))

    out = initialize_video_writer('watermarked_video.mp4', fps, frame_size)

    block_size = 4
    strength_factor = 0.5
    watermarking_bit = 1

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)
        selected_coefficient = apply_dwt(frame_yuv, block_size)

        # Apply PCA 
        matrix_B = apply_pca(selected_coefficient)
        # print(matrix_B)

        # Calculate supporting bit S 
        supporting_bit = calculate_supporting_bit(matrix_B)
        # print(supporting_bit)

        # Apply watermarking conditions
        modified_coefficient = embed_watermark(selected_coefficient, watermarking_bit, strength_factor, supporting_bit)

        modified_coefficient_resized = cv2.resize(modified_coefficient, frame_size[::-1])

        # Update the frame with modified coefficients
        frame_yuv[:, :, 0] = modified_coefficient_resized

        # Convert back to BGR for writing to the output video
        frame_watermarked = cv2.cvtColor(frame_yuv, cv2.COLOR_YUV2BGR)

        # Resize the frame to the original size
        frame_watermarked = cv2.resize(frame_watermarked, frame_size)

        # Write the watermarked frame to the output video
        out.write(frame_watermarked)

    cap.release()
    out.release()
    cv2.destroyAllWindows()

# encode()

def encode_half():
    # Load your video file (replace with your actual video file)
    video_path = 'suburbia-aerial.mp4'

    # Read the video
    cap = cv2.VideoCapture(video_path)

    # Define parameters
    k = 5  # Number of frames to group together
    strength_factor = 0.5  # Strength factor for embedding

    # Initialize the video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    output_video_path = 'watermarked_video.mp4'
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    out = cv2.VideoWriter(output_video_path, fourcc, fps, frame_size)

    # Initialize a buffer to store frames
    frame_buffer = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert frame from RGB to YUV
        frame_yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)

        # Divide each frame into non-overlapping blocks (e.g., 4x4 blocks)
        block_size = 4

        # Apply DWT to each block and extract coefficients (LL, LH, HL, HH)
        coeffs = pywt.dwt2(frame_yuv[:, :, 0], 'haar')
        cA, (cH, cV, cD) = coeffs

        # Calculate the supporting bit S
        center_value = cA[block_size // 2, block_size // 2]
        other_values_mean = np.mean(cA)
        supporting_bit = 1 if center_value - other_values_mean >= 0 else -1

        # Apply DWT to the luminance channel and extract coefficients (LL, LH, HL, HH)
        watermarking_bit = 1  # Example: +1 or -1
        selected_coefficient = cA[::block_size, ::block_size]

        # Implement watermarking conditions
        if watermarking_bit == 1:
            selected_coefficient *= strength_factor
        elif watermarking_bit == -1:
            selected_coefficient *= (1 / strength_factor)

        if supporting_bit == watermarking_bit:
            cA[::block_size, ::block_size] = selected_coefficient

        # Perform inverse DWT to get the watermarked frame
        frame_yuv[:, :, 0] = pywt.idwt2((cA, (cH, cV, cD)), 'haar')

        # Convert back to BGR for writing to the output video
        frame_watermarked = cv2.cvtColor(frame_yuv, cv2.COLOR_YUV2BGR)

        # Resize the frame to the original size
        frame_watermarked = cv2.resize(frame_watermarked, frame_size)

        # Write the watermarked frame to the output video
        out.write(frame_watermarked)

    cap.release()
    out.release()
    cv2.destroyAllWindows()


def encode_full_process():
    # Load your video file (replace with your actual video file)
    video_path = 'suburbia-aerial.mp4'

    # Read the video
    cap = cv2.VideoCapture(video_path)

    # Define parameters
    k = 5  # Number of frames to group together
    strength_factor = 0.5  # Strength factor for embedding
    m = 10  # Number of eigenvectors for PCA (adjust as needed)
    block_size = 4  # Size of the block for watermarking
    watermarking_bit = 1  # Watermarking bit (+1 or -1)

    # Initialize the video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    output_video_path = 'watermarked_video.mp4'
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    out = cv2.VideoWriter(output_video_path, fourcc, fps, frame_size)

    # Initialize a buffer to store frames
    frame_buffer = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert frame from RGB to YUV
        frame_yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV)

        # Add the current frame to the buffer
        frame_buffer.append(frame_yuv)

        # Check if the buffer contains k frames
        if len(frame_buffer) == k:
            # Flatten the coefficients (matrix A) for PCA
            flattened_coefficients = np.concatenate(
                [pywt.dwt2(frame_buffer[i][:, :, 0], 'haar')[0].flatten() for i in range(k)]
            )

            # Reshape to a 2D array for PCA
            flattened_coefficients = flattened_coefficients.reshape(k, -1)

            # Perform PCA using SVD with truncated SVD
            _, _, eigenvectors = np.linalg.svd(flattened_coefficients.T, full_matrices=False)

            # Select the first m eigenvectors
            matrix_B = eigenvectors[:, :m]

            # Apply watermarking to each frame in the buffer
            for i in range(k):
                cA, (cH, cV, cD) = pywt.dwt2(frame_buffer[i][:, :, 0], 'haar')

                # Calculate the supporting bit S
                center_value = cA[block_size // 2, block_size // 2]
                other_values_mean = np.mean(cA)
                supporting_bit = 1 if center_value - other_values_mean >= 0 else -1

                # Apply watermarking conditions
                selected_coefficient = cA[::block_size, ::block_size]
                if watermarking_bit == 1:
                    selected_coefficient *= strength_factor
                elif watermarking_bit == -1:
                    selected_coefficient *= (1 / strength_factor)

                if supporting_bit == watermarking_bit:
                    cA[::block_size, ::block_size] = selected_coefficient

                # Perform inverse DWT to get the watermarked frame
                frame_buffer[i][:, :, 0] = pywt.idwt2((cA, (cH, cV, cD)), 'haar')

                # Convert back to BGR for writing to the output video
                frame_watermarked = cv2.cvtColor(frame_buffer[i], cv2.COLOR_YUV2BGR)

                # Resize the frame to the original size
                frame_watermarked = cv2.resize(frame_watermarked, frame_size)

                # Write the watermarked frame to the output video
                out.write(frame_watermarked)

            # Clear the buffer after processing
            frame_buffer.clear()

    # Release resources
    cap.release()
    out.release()
    cv2.destroyAllWindows()

# Example usage

encode_full_process()

video_path = 'suburbia-aerial.mp4'
output_video_path = 'decode_watermark.mp4'
strength_factor = 0.5  # Adjust as needed
# decode_watermarked_video(video_path, output_video_path)

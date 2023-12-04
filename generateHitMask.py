import os
import shutil

from PIL import Image


class HitMask:
    def __init__(self):
        self.choose_dir = ""
        # alpha 阈值
        self.alpha_threshold = 50

    def set_choose_dir(self, choose_dir):
        self.choose_dir = choose_dir

    def set_alpha_threshold(self, alpha_threshold):
        self.alpha_threshold = alpha_threshold

    def create_png_alpha_hit_mask(self):
        file_list = []
        self.find_png_files_recursively(self.choose_dir, file_list)

        print("Find", len(file_list), "png files")

        # 查找文件
        if not file_list:
            print("Hasn't png")
            return

        for file_path in file_list:
            file_dir = os.path.dirname(file_path)
            file_name = os.path.basename(file_path)

            img = Image.open(file_path).convert("RGBA")

            width, height = img.size

            dst_img = img.resize((width // 2, height // 2), resample=Image.Resampling.BOX)
            width, height = dst_img.size

            bits_size = width * height

            byte_size = (bits_size + 7) // 8
            bytes = bytearray(byte_size)
            bits = [0] * bits_size

            for y in range(height):
                start = (height - 1 - y) * width
                for x in range(width):
                    if dst_img.getpixel((x, y))[3] > self.alpha_threshold:
                        bits[start + x] = 1

            for i in range(bits_size):
                if bits[i]:
                    bytes[i // 8] |= (1 << (i % 8))

            # 获取输入文件夹的父目录
            parent_dir = os.path.dirname(file_dir)
            output_dir = os.path.join(parent_dir, "mask")
            # 如果输出文件夹不存在，则创建它
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            dst_file_name = os.path.join(output_dir, os.path.splitext(file_name)[0] + ".bin")
            with open(dst_file_name, "wb") as f:
                print(f"转换成功：{dst_file_name}")
                f.write(bytes)

    def find_png_files_recursively(self, dirname, file_list):
        for root, dirs, files in os.walk(dirname):
            for file_name in files:
                if file_name.endswith(".png"):
                    file_path = os.path.join(root, file_name)
                    file_list.append(file_path)


if __name__ == "__main__":
    hit_mask = HitMask()
    all_dirs_local = ["blkt", "ml", "mt", "xzl"]
    all_dirs_online = ["bs2", "chf", "ct", "etf", "kt2", "ty", "ws", "ws2", "yc", "ys"]
    for i in all_dirs_online:
        dir = fr"D:\pdragon\fkx2\Resources\res_onlineRes\pub\rooms_b\{i}\pic"
        hit_mask.set_choose_dir(dir)
        # 获取输入文件夹的父目录
        parent_dir = os.path.dirname(dir)
        output_dir = os.path.join(parent_dir, "mask")
        # 如果输出文件夹不存在，则创建它
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        # 删除改文件夹下的所有文件
        shutil.rmtree(output_dir)
        hit_mask.set_alpha_threshold(50)
        hit_mask.create_png_alpha_hit_mask()
    for i in all_dirs_local:
        dir = fr"D:\pdragon\fkx2\Resources\res_buildRoom\pub\rooms_b\{i}\pic"
        hit_mask.set_choose_dir(dir)
        # 获取输入文件夹的父目录
        parent_dir = os.path.dirname(dir)
        output_dir = os.path.join(parent_dir, "mask")
        # 如果输出文件夹不存在，则创建它
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        shutil.rmtree(output_dir)
        hit_mask.set_alpha_threshold(50)
        hit_mask.create_png_alpha_hit_mask()

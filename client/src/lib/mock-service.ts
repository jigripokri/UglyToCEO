import professionalHeadshot from "@assets/generated_images/professional_headshot_after.png";

export const transformImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(professionalHeadshot);
    }, 3000); // 3 second delay to simulate "processing"
  });
};

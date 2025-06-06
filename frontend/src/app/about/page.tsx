// src/app/about/page.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footer } from "@/components/footer";

// Team member type definition
type TeamMember = {
  name: string;
  role: string;
  profilePic: string;
  description: string;
  linkedin?: string;
  github?: string;
};

export default function AboutPage() {
  // Updated with direct LinkedIn profile picture URLs
  const teamMembers: TeamMember[] = [
    {
      name: "Rohit Bhandari",
      role: "AI/ML & Backend Engineer",
      profilePic: "https://lh3.googleusercontent.com/fife/ALs6j_E_b-cVfBchjgpVA2TFdsh9mLbu_czoALlHreoylqMaezWB_YDIeEzFRAU1zgug7WqLqf_kO94UfNJ8kays2_Iw49lC1hlW3_PMP6e0HcwfJgrxk8Q3xtOX9WRnv4zyt9MoUtHgA3_l2dw7JB564Hdh-jJvvwlT3MOTNHkvtXeE3n1jZXi3n8s5nX24yKTnGkCgOHn_UVBEL20UYb5ztkxEELEebhfd9YAmPFuXY1LObfB1PNkCfwI38k4ntfDXhyu9UW3B_w88TwpbvTocT9qcAd7h0vSayDMoEOdKz189OA0QhKdRva-cxO7im5zD6raDpTcM60OlEXpG-WoCu7G5-gsRooHWa3DZ8UZOyjKNVnpHFCCPSVTuUE3-wUfFpOWdmq5_CJKNp8p5TI9U2W6QmBMiYYXv8a7mJkMOzSozmQVvVE8SCJz6V9_fQ3WWmXSkk1ypdV9A9ilojqafyA53qyztLdmZ6TimqBLCiS7iRrJN71c6Mp3awWrCsY7o3Mdcac-vPTfYvba4DRvQWjiD2zoyO3oOhL0L-2u3bOrYzp_MtuNnSDNDPhKq5lASJKCCHGDCTEMEwvpPBBfpSzKpH2P6F3PrHfl8KSQuawCrFklDWFkIYRtT8u65vXtAAXpxyq2w93cRPfSGBCFDqylcXhIlEFeoi-zG7zOejOyXIMsVq6wFOOSrbxXEUZCB5MtFM49C9D5nacRSG90kcHVNZGc1HsZSIMYQb6TRwhkgGs5BRL1FrS0OZYA116CHhhfKjrkwgT0jND6FMb_zVdHJBiHpDAVrA-5hU2JpKcVkZWvIgwbNuIB593gx36z0pY6_Fsfk9oUBE0UPzxmo9yqeVvE-vydKaZl18QoieRRlEmFKrFBnFcjBAEhoENJzo9m6DMBL9LPG3RAjAQ6ARWhzj-BTgFIQyS52YPXJbNu-3VGGUZXEqxFHVKJCEd5-LCTEJlMaVNdTDvFDxg2HavVWd2hjbbH7P2AW_YWbkhuLqmagiRAzgm7ijdroqBXm5KO9PA3on9nO7tTRE-PROZbg3DJZOtrNtgNt1N_TMr4Q2rWKKr4zN_6UfsCwxtuMhyZquXUR73g3Pk9IyuItt5K8fJAog7vibESfv9OJFYwwuEc7rzOAzj-AKRw5QcxTgH4CJDDW0fjcaBEDFNQDVK5l21E36C0WELzHHuA0HMaMpUw92Rq-KHZ7_wJnug6aD634Sb_3pj83xs3ODD-H2xvWogGrRhGwjd3lWv8SsEoyvwQyzzMhlSZAIuZNygHFVK7IWbRekrP4gjl6c19cGCape5JlLPnay_T9gZvY3wxWaVkrgxEsTxbdkabXF1JoqTujg4I0MtwQLL6XPTDJwus0zJ2Uo839SF6ASzsz2gl8nvSSP_Uzk_9sGsEc6JNGs0IWSxLBm78cECEri2RVmoLdQp0gE5VbvTR34PZiBooiyswNdk2QLQAOlthnClrKaEO_2SJJPeMUgxxSdfaH_VJJScn4EO7EBxTXUvJj5iKvP3-VpwTHHx963VJzlRjvrtAnqGjUEK86B7ekGHrJx9my2Df5g2SZRFDtjebLoJ-J0fNi2ECYV3EIy-_z7FucXjwQSKs3feNG5EuJCjmU4Y6JcAmOgRc4ny_zEO0SNuUq7ioQYbhO-cAFX_iVKB1fa9gwgYyUXELSCZkk0OHifm15c_i6Sjbvnw=w2560-h1330?auditContext=prefetch",
      description: "Specializes in developing the AI algorithms for lung cancer detection using deep learning.",
      linkedin: "https://linkedin.com/in/rohit-bhandari",
      github: "https://github.com/TheLMNTRIX"
    },
    {
      name: "Varad Kakodkar",
      role: "AI/ML & Backend Engineer",
      profilePic: "https://lh3.googleusercontent.com/fife/ALs6j_EEQrTBBb6PuDcnXGw0r7kpxuyamK-OSozgUPbXibuDKVZBc3L457_8qiZNi3iemzdfpNsvzb4A-RQbw9MGa3OWi1aGE9llpksKjjiAivCa2fcvJoejyQDPXLD8-DfwYHBM-c77uwPjf4cKy7W-426UwaFLiPUFRsGKc5W824brEgwVqNujNBNJzW7PDxkuMZe202Wp51ObInZ7NaS0Wf3-7iEDiIdwVj5NWM7JBUrxfEHxcC7ON5FUaGOZ8EIcfn91HBzY0tdeQFmMv3_A04dCS8vDkx_AHb6oTa5KLHqgU1IrE6kRsgjejcnLYrlfRel6l6S2bOS7j-s7bm8clEvq0WxqLY9qg3YTLjgdMQEDKVQ9SUMbSZdexxNU_8KPgQYA8RbXyP1Ki3UNgX5L2RPcLmnRpI-xQBlgyEAXNjSD7QDX9EIiVQ5HZLYdRrPa1lsqcD3TfEWw-S6d0K0DyppHjFoftV186ozyDnlQCK0ub6BE7JsTtQxTVHcTnSRUjve0h5HyGYyzaKCCVzgOorLbm2Q8Rp0wCQv3X5r8wOJYO7YX6UOuSKdwj91-Uf_sPDRoTOE9t9sOBsfG3csk_2vdB59FnSbR-pD9kEe5L6ugoIF0kMFeXXfFjvVO5ZJTX6rqy_8MvmRDvEfbxCNSrBxUaZp17lNcw_HPNFujGAkkmttKNIkt1On7mwlp-iRd9an_JImkn72SRjb2o_FTVPJ8JMqFhRJopDv0UCNOwwfepTLOnj28Xgbzqcx6qGVmXZzgk8muJ8jt2qNUm_7P2AayRLEQaM0B7Er1wvCGARRCbn71I11fzknfvFSTPz18FfZAleSaPFT4bDt8Cyr1gnLPNtM_NfSpyJlp57GU6HRiRY1xKPEmnbMOk1ZbpzUZW56oZz0tFHzvj_QES-Ctjt77CvSv4jQyQ3fpjf-cqESKUsRjQGLB1a6PPFJ3UoPE5Hw4qqHscwlSpI-YCAimPQbbcHuRQ-l0Zl3Xl5AMYn4MUCkcNQl65vuy7thXjCHXiXKvtoYUA6mx_wtvJ3OC3YE3SpnP_VI9L8ZTItSBG14sIUWklgDG3Fj3wBUiLzka4D3gxnWWmS9vX9ZOx1KyoqEbLKRaKfxCXC56-o6d1L3L85IwtKmPF89J-UYvRiye2bx_IzfB0jEHa-rQHEarE9Nyx0woavPRHsXL9FgpcyNv4MatWgvQ-ATS_dzJqTNrEgEd6iFYB6_A4hyZ69yuS7PSo7jcS2TLBcfMcehO3j10cXkT_EIO4VWhJSNmkeLQ9h4ebLPu5iPFcwAS4kHarUzKxE8NRZDMRLHW-JyZgoeyQZeqeF5YyeNmv9KobdJVHN2W2aqvy6giGh88s29TwDyAo563kaSpFT351xboC-zPwW_N09ksFLfmplHFbVRSI_HjAT9m2mPjadEjkmBRN5QzfKDnnBlxpkYejv605z4PsPLmPg3akmY_3723OIm9DlLH1zqdM0qYXi8ZB1NCCbb5jTMN2dxKAkZRAKBM-KYSB-SI04dMcRj6D5x8_mAsFUOClal6VZ2h4yMw0_DuetQEyxYrFiPT_8j_hIfWVMIeiOiHzjpCxr5gSVq9Kgq8zho_hj7d3S4RNJX1nvFbvk8iNOIRi7AxOmK2R-ImdMO33qP4etNtDe2ZNnPfVVALezUBUYP7EuAyL2xRAe5VJAVxRGyzj57vvw=w2560-h1330?auditContext=prefetch",
      description: "Leads the development of AI algorithms and backend infrastructure for accurate diagnosis.",
      linkedin: "https://linkedin.com/in/varad-kakodkar",
      github: "https://github.com/rinzler8x"
    },
    {
      name: "Sailee Phal",
      role: "Full-Stack & AI/ML Engineer",
      profilePic: "https://lh3.googleusercontent.com/fife/ALs6j_GLxqX6ZwZfyjv12ALJRTd4beAaTmGQwF0GPfw_HGZVQbJSUmYok4Ubl_9NOreulouTiafZOFz5DnUWueXRAQlHSK3Bn4oTtQJQmG3SV8EwmrNTWuFsj2gzd481FGtnPUpo1F5E2GCE_XhdvejVOympLYSR4wzz4eta-RRgA6X8QHTmykxlM3d60iYV-jR9yOwE5tMjCEwIt-F6VVCA2bEhGoKm_lefdMqjEkcY9TJ5k05uMQ29iczV5o9zMrVfnWrucmYwCD5n8EuOUoEKb0u-uD-56PP2aIrPQUgqcogT0qYcn6rSE19NrHcNlkZzz4d4eAAfyKy2nw20Mve6-5qrmJzOiu9yKshBtI13xd8zhYDtemMMeGZMqvkjc-mnsHaxFuayJtSw3-3hJ8xWwdFd5yrTWrEaGl6Ku7eU2ivTuNWHypsM5FLLSiN2DiBgc8ntsdFoZxeXczNg-lTL-7vm8k1hdVFpE4tFBdnmxXwRn_wCYqntGO78BiNisPx4Z_6DQm14-TlkwbnI_temF94rYRsgnqnIDpvPK55uSNYjLSSAtr-VHlWvhiiGJBtRgf0vs6r7Hc5MJaNCiaBEXLug8TKhy1sKhxRcJHPQRtU21FSL9UUWUNh_fJ1hSt_gZpT4Y3cVGCeYcSiIdtx42IPIG_4sgs2HoCoOdQdVUyHLDOUMRiK_dWBf0cIXLQWqT-Xggo33RK5H23AzFu8f1AF-UDrz8qrSEMGFb5T-FZTRWvc9TlrO79u6WQuX40fPfl-1sYITrCL72ID-kqx2rrmXOLSsXrKZ-NfWufP9HW9-p8m6s5RTgS-ehFUEEAX8Ck1GhG9ZvsS7gcs9d2-cLQB0DvJMG6FqRB0fzpuQmqSRuJDoN_MK6-67W_3CF-tUHGcKzW3UBJmEBHK62wV2UqBeDdlnKBFdlE1ORbZ73kukcch-FtcbAsLsh1L0VJ5v7TB_gzl3-Atf0kbYrnUNxQQD63nMMUfbCrQMQm-M4DEGBM3QPINNEmobECryGYbOvJiAqtgJfe-yvM1FcSd13HFnGHlMQSyrHy2uTF21pkUsGkR28oJEyw_ZR5HCpHC8GVHe0hm20x-rmrFb0zUvZ6pfApU_jOc14cCf56ViN8dT92mUwUwPfBIwNqE-xnpqDYj3dJ1hrqZkD1JWVhOrxPDEkqSwDYrbMd9_rrZ-DMNO5zUnPJJRiP6mr5Y3k58TRzpUQJVg2fc-r8RKe6rN_yDcYWSBcrrrx_PFs_v2KL7Aag7bViCrXFsHQRnLQw8Jw_bJmog5avyBXqCDwz-FJZINMywx8gsIpCyiRSdfrbsCW6-gf9xyN2LpShnHcJr2qLjVmxyuCAjIa8qUIjNZYJE2-due-e4N-RS8_0lNvcbjuLYMCiuHCGz6UJA6D4zBbt8SaIFKvflspdiIzgGQX67FHz2ylU-N0_0efnzhwFiP18EsszMaCKYO3KfhCwDP0qTa_wYBkkYT-_KER2ZRsjYaE_ZfwOJTxB2HPUF7HfBbZt6iuOePJ5kAH0-v_34Tx3bN97xq-lp5zRTuzMYK28gcnIn4_Oqq4uzcuqfrEvJYVe7weIEjz4OF2Jkf5Jy9fgoI5Dfr0GT9PP5vTYdMsgb-3c3TId6_dM69DPXxACTTc4jkMWSTV4HwhcvlR3lFVMzuZOwEPhfwWjujGkK4NHLLqy8Rglgr=w2560-h1330?auditContext=prefetch",
      description: "Contributes to AI/ML model implementation and integration, while working on both front-end and back-end development to ensure seamless functionality.",
      linkedin: "https://linkedin.com/in/sailee-phal",
      github: "https://github.com/saileephal"
    },
    {
      name: "Viraj Naik",
      role: "Frontend Engineer",
      profilePic: "https://lh3.googleusercontent.com/fife/ALs6j_FVQ-rjJOnK1W_98oqE6-yOvH8c720_S8V9KLTKQ2mSvr_QrHq78tfO7NbltnIg9kB7Iwo-HKzpE4DAPPAMrQW6wsgm8kDy5nYr1kLD0PvOyyF7JDfP0E4gBpjhHxnUq-Yz4d8UDmDUUwb5we4onstcrKX0tFYOrTxLQJfYiBCkm2cLuwiD6u_qrIOrE9CHkm10X7hlLhQdGhJJQE4GKyzlV0nQKC5Ipv5F5OWqyAwZsVJ-wiW3E1ks7Sb4lkWu8gg2ethlLrq9Hiw48PwbO1yTzrr6XdYKxlPHqnMRUUG9kR5kEgEKS16bZNKDl5T2-kh5bDbj85ViokZb_WJ2H0HkDAqXCNfJE7koa_vZbYoVomQkZ-cZahr0xPKtqc5iyvJdP0qwGhkPRVjEjbeU8zJi1oQFpWBaBN3kBs6Li263W4_0NeivjHCI5TXJyy7KmWfXZvBZWJjjCAs1Mj-s2_WzqonnBPApPK-mrM55I7hZsvcd3apz7T1At2_VHzjyPzcv7W4B0i3aNvtiuSPH9aT8Q_SlfebvyjksO9YfIBuiS9bn4_zAsJ7xGUn9inBliewpHJ2qKL6pOXjjSXCFBUcW4gZVtjwicV9Jb3gYHNNrcFynbtz_LVqKHEze5KUbGvliX9eN8cwDekvuNynohO-0rVVpvJ9CVz726WFcYBH92o5UoNgpTB3ncswKOek2cDM3itCpuIUY1z3IkU4ZrVncY4wdH76nCgklBGMlOuynU11vxUhKmCk1qF2XD64HLGXXq9wbNsq4BY9c7Uh2Tm1RxZUIiUTlXBHDUTV5bSck47dWldSGJNIshHEOiePrPaX914sH5yEdMjIkWX2QJA3bUkNhmhMXVI51Pon3kbqXQ-R2yxZY04-AkXEfr_Tn0-nwBDipcSWnc577-VsqdpamFYVBq_oaH8JJ2qwCsjG2jYl4mUQEc08OfGR0G99kgx0T_ltPDrtEuQmT30IHRXL_OE2qM99YcQTv-UJNgSj9_C0gVAsX6OrIdIPLFRHmdV7ziFHQO5q2RuxBQw3ysvHT6X0Elj_iCxEmuhlz7PaZo2nB9S3hnMPyxAMVpO_ZGuy1se-D7eljjyFcBuYApixpcf0cfD4bU2-4ZdwCMZoaDKL9S7OvKHDcv8egxI5tZuMYXil3P1gKuYu-l5uCeoEWC_5zweSCVl1CgTPoNtQe8E8ogPf1aCh-bcZJgeUcqhsEDKdKlMvl38gMwvmBZLJz6oR2WNZfaEDQQGzwim2nKR00VBlztd3n7AzYpQiiB5ZKiMqcwP_It3MMHJwlXjVzv6gGK3mRWIlrxkzwrm_q52Eeh9HgpH8z0qUGKDqEbwQJHpg7bZgkIxpaShQot9b6QBoHp9LpBEcKTE7rj77mHJN7W2djP3GFK8NVDzcvN6E7woUN14lP__TPU7bOalQ7lNiIE_x8JnM1Qw92fkgbgWGKY1ewsIsYXnNuropzVMLp9HPHelAGvVr9WAA_JI3IZ1s0FTEU7TiDa1BUxQzzYpGarXt-NnVSKbOO6YBzFkEgKASGQHUzqV9Agz6FXRgQbpav3CoABJyhprIBvGJneXldCUhfF9gnFt1STq4oqCRrJEvvG2PYIqORBv-4r8GxKneb7N-pyFcfPdqhwkXN2eroGaYksMEXxKML__mfNBSMwaUOcRTlPXP8oHvTFC_9h06roSgMJw=w2560-h1330?auditContext=prefetch",
      description: "Leads frontend development with a focus on creating intuitive interfaces for medical professionals.",
      linkedin: "https://www.linkedin.com/in/virajnaik128",
      github: "https://github.com/naikviraj"
    }
  ];

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6">About PulmoSense AI</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          PulmoSense AI is a cutting-edge medical technology project designed to revolutionize
          lung cancer detection through deep neural networks. Our mission is to provide
          early, accurate, and accessible diagnosis tools to improve patient outcomes worldwide.
        </p>
      </div>

      

      <Tabs defaultValue="mission" className="mb-16">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="mission">Our Mission</TabsTrigger>
          <TabsTrigger value="technology">Our Technology</TabsTrigger>
          <TabsTrigger value="impact">Our Impact</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mission" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Mission Statement</h2>
          <p className="text-gray-700 mb-4">
            At PulmoSense AI, we are committed to developing innovative AI solutions that help
            healthcare professionals detect lung cancer at earlier stages when treatment is most effective.
          </p>
          <p className="text-gray-700">
            We believe that by combining advanced machine learning algorithms with medical expertise,
            we can create tools that are not just accurate but also accessible to healthcare providers
            around the world, regardless of resource constraints.
          </p>
        </TabsContent>
        
        <TabsContent value="technology" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
          <p className="text-gray-700 mb-4">
            PulmoSense AI utilizes state-of-the-art deep learning models trained on thousands of
            annotated CT scans to identify potential signs of lung cancer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Advanced Image Recognition</h3>
              <p className="text-sm text-gray-600">
                Our models can detect nodules as small as 5mm with high sensitivity and specificity.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Easy Integration</h3>
              <p className="text-sm text-gray-600">
                PulmoSense AI is designed to integrate seamlessly with existing healthcare IT systems.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="impact" className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Making a Difference</h2>
          <p className="text-gray-700 mb-4">
            Early detection of lung cancer can increase the 5-year survival rate from less than 20% to over 70%.
            Our technology aims to make this level of early detection widely available.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <p className="text-blue-800 font-medium">
              Our goal is to promote sustainable development and minimizing biomedical waste generated from medical tests.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.name} className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {/* Updated to use direct LinkedIn profile URLs instead of local images */}
                <img 
                  src={member.profilePic} 
                  alt={member.name}
                  className="object-cover rounded-full mx-auto mt-6 border-4 border-white shadow-sm"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                <div className="flex justify-center space-x-3">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                      </svg>
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center py-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Partner With Us</h2>
        <p className="max-w-3xl mx-auto text-gray-700 mb-8">
          We're always looking for healthcare partners, researchers, and institutions interested in
          advancing early lung cancer detection technology. If you'd like to collaborate or learn more,
          please reach out to us.
        </p>
        <a 
          href="mailto:contact@pulmosense.ai" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Contact Us
        </a>
      </section>
    </main>
  );
}
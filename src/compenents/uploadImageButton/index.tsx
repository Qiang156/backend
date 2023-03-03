import React, { useEffect, useState } from "react";
import { Button, Row, Col, Modal, Image, Empty, message } from "antd";
import { resource, resourceCategory } from "../../api";
import styles from "./index.module.less";
import { CreateResourceCategory } from "../createResourceCategory";
import { CloseOutlined } from "@ant-design/icons";

interface CategoryItem {
  id: number;
  type: string;
  name: string;
  sort: number;
}

interface ImageItem {
  id: number;
  category_id: number;
  name: string;
  extension: string;
  size: number;
  disk: string;
  file_id: string;
  path: string;
  url: string;
  created_at: string;
}

export const UploadImageButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [defaultCid, setDefaultCid] = useState(0);
  const [refreshCategories, setRefreshCategories] = useState(1);
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const getCategories = () => {
    resourceCategory.resourceCategoryList("IMAGE").then((res: any) => {
      let data = res.data.data;
      if (data.length > 0) {
        setDefaultCid(data[0].id);
        setCategories(res.data.data);
      }
    });
  };
  const removeCategory = (id: number) => {
    resourceCategory.destroyResourceCategory(id).then(() => {
      message.success("删除成功");
      setRefreshCategories(refreshCategories + 1);
    });
  };

  useEffect(() => {
    getCategories();
  }, [refreshCategories]);

  useEffect(() => {
    if (defaultCid === 0) {
      return;
    }
    resource
      .resourceList(page, size, "", "", "", defaultCid + "")
      .then((res: any) => {
        setTotal(res.data.total);
        setImageList(res.data.data);
      })
      .catch((err) => {
        console.log("错误,", err);
      });
  }, [defaultCid]);

  return (
    <>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
      >
        上传图片
      </Button>

      {showModal && (
        <Modal
          title="图片素材库"
          onCancel={() => {
            setShowModal(false);
          }}
          open={showModal}
          width="1000px"
          maskClosable={false}
        >
          <Row gutter={16}>
            <Col span={4}>
              <>
                <div className={styles.categoryTitle}>
                  <div>图片分类</div>
                  <div>
                    <CreateResourceCategory
                      type="IMAGE"
                      onUpdate={() => {
                        setRefreshCategories(refreshCategories + 1);
                      }}
                    ></CreateResourceCategory>
                  </div>
                </div>
                {categories.length === 0 && (
                  <Empty
                    description="暂无分类"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  ></Empty>
                )}

                {categories.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.categoryItem} ${
                      item.id === defaultCid ? "active" : ""
                    }`}
                    onClick={() => {
                      setDefaultCid(item.id);
                    }}
                  >
                    <div>{item.name}</div>
                    <div>
                      <Button
                        danger
                        shape="circle"
                        onClick={() => {
                          removeCategory(item.id);
                        }}
                        icon={<CloseOutlined />}
                      />
                    </div>
                  </div>
                ))}
              </>
            </Col>
            <Col span={20}>
              <Row>
                <Col span={24}>
                  <Button type="primary">上传图片</Button>
                </Col>
              </Row>
              <Row
                gutter={[
                  { xs: 8, sm: 16, md: 24, lg: 32 },
                  { xs: 4, sm: 8, md: 12, lg: 16 },
                ]}
              >
                {imageList.length === 0 && (
                  <Col span={24}>
                    <Empty description="暂无图片" />
                  </Col>
                )}

                {imageList.map((item) => (
                  <Col span={6}>
                    <Image src={item.url} />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Modal>
      )}
    </>
  );
};
